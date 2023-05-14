/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @name tkio_reporte_avance_CS
 * @version 1.0
 * @author Dylan Mendoza <dylan.mendoza@freebug.mx>
 * @summary Script para incrustar en la pantalla principal, controla las acciones de usuario
 * @copyright Tekiio México 2023
 * 
 * Client              -> Fasemex
 * Last modification   -> 18/04/2023
 * Modified by         -> Dylan Mendoza <dylan.mendoza@freebug.mx>
 * Script in NS        -> N/A <N/A>
 */
define(['N/currentRecord', 'N/ui/message', 'N/https', 'N/url', 'N/runtime', 'N/record'],

function(currentRecord, message, https, url, runtime, record) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        try {
            var reg = scriptContext.currentRecord;
            changevisibility(reg);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * The function changes the visibility and display properties of certain fields and elements on a
     * web page.
     * @param reg - The "reg" parameter is likely an object representing a registration form or a
     * section of a registration form. The function is using this object to access and manipulate
     * various fields within the form.
     */
    function changevisibility(reg) {
        try {
            var empField = reg.getField({fieldId: 'custom_pronest_emp'});
            empField.isDisabled = false;
            document.getElementById("custom_pronest_emp").focus();
            var cncField = reg.getField({fieldId: 'custom_pronest_cnc'});
            cncField.isDisplay = false;
            var nestField = reg.getField({fieldId: 'custom_pronest_nest'});
            nestField.isDisplay = false;
            var codeField = reg.getField({fieldId: 'custom_pronest_code'});
            codeField.isDisplay = false;
            var clearField = reg.getField({fieldId: 'custom_clear'});
            clearField.isDisplay = false;
            var regField = reg.getField({fieldId: 'custom_reg_seg'});
            regField.isDisplay = false;
            var tableStyle = document.getElementById('table_result').style
            tableStyle.fontFamily = 'Open Sans';
            tableStyle.fontSize = 'small';
            tableStyle.textAlignLast = 'center';
            document.getElementById('table_result').style.visibility = 'hidden';
        } catch (error) {
            console.log('changevisibility Error: ' + error);
        }
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        try {
            var scriptObj = runtime.getCurrentScript();
            // console.log('Remaining governance units: ' + scriptObj.getRemainingUsage());
            var reg = scriptContext.currentRecord;
            var clearField = reg.getValue({fieldId: 'custom_clear'});
            console.log('clear: ' + clearField);
            if (!clearField) {
                console.log('Usted esta modificando el campo id: ' + scriptContext.fieldId);
                switch (scriptContext.fieldId) {
                    case 'custom_pronest_emp':
                        console.log('Campo del empleado');
                        changeFocusField(reg, 'custom_pronest_emp', 'custom_pronest_cnc');
                        break;
                    case 'custom_pronest_cnc':
                        console.log('Campo del CNC');
                        changeFocusField(reg, 'custom_pronest_cnc', 'custom_pronest_nest');
                        break;
                    case 'custom_pronest_nest':
                        console.log('Campo del NEST');
                        changeFocusField(reg, 'custom_pronest_nest', 'custom_pronest_code');
                        break;
                    case 'custom_pronest_code':
                        console.log('Campo del Codigo ultimo enter');
                        var lastField = reg.getField({fieldId: 'custom_pronest_code'});
                        lastField.isDisabled = true;
                        reg.setValue({
                            fieldId: 'custom_clear',
                            value: true
                        });
                        var relationOT = getRelationsOT(reg);
                        if (relationOT.succes == true) {
                            console.log('Fin del flujo');
                        }
                        break;
                    default:
                        console.log('Algo esta cambiando');
                        break;
                }
            }
            console.log('Remaining governance units fin: ' + scriptObj.getRemainingUsage());
        } catch (error) {
            console.log('Error: ' + error);
        }
    }

    /**
     * The function changes the focus to the next field and disables the current field in a form.
     * @param reg - It is likely an object or variable that represents a form or form registry. The
     * function is using this object to access and manipulate form fields.
     * @param actualFieldId - The ID of the current field that has focus and needs to be disabled.
     * @param nextFieldId - The nextFieldId parameter is the ID of the field that the function will
     * change focus to.
     */
    function changeFocusField(reg, actualFieldId, nextFieldId) {
        try {
            var actualField, nextField;
            actualField = reg.getField({fieldId: actualFieldId});
            actualField.isDisabled = true;
            nextField = reg.getField({fieldId: nextFieldId});
            nextField.isDisabled = false;
            nextField.isDisplay = true;
            document.getElementById(nextFieldId).focus();
        } catch (error) {
            console.log('Error: ' + error);
        }
    }

    /**
     * This function creates a record of data using a Suitelet URL and returns a boolean value
     * indicating success or failure.
     * @param datos - The parameter "datos" is an object containing data that will be sent to a
     * Suitelet script via a POST request. The data is first converted to a JSON string using
     * JSON.stringify() before being sent. The Suitelet script will then use this data to create a new
     * record in NetSuite.
     * @returns a boolean value, either true or false, depending on whether a record was successfully
     * created or not.
     */
    function createRecord(datos) {
        var dataReturn = false;
        try {
            if (datos) {
                var suiteletUrl = url.resolveScript({
                    scriptId: 'customscript_tkio_repor_avanc_ws_sl',
                    deploymentId: 'customdeploy_tkio_repor_avanc_ws_sl',
                    returnExternalUrl: true,
                    params: {action: 1}
                });
                // action = 1 significa crear:
                console.log('suiteletURL: ' + suiteletUrl);
                datos = JSON.stringify(datos);
                console.log(datos);
                var headerObj = {
                    name: 'Accept-Language',
                    value: 'en-us'
                };
                var response = https.post({
                    url: suiteletUrl,
                    body: {data:datos},
                    headers: headerObj
                });                
                var myresponse_body = JSON.parse(response.body); // see https.ClientResponse.body
                console.log(myresponse_body);
                var regCreate = myresponse_body.regCreate;
                if (regCreate.length > 0) {
                    var mensaje = 'Se a creado el registro de seguimiento con la información capturada id:'
                    if (regCreate.length>1) {
                        mensaje = 'Se han creado los registros de seguimiento con la información capturada ids:'
                    }
                    console.log('RegistroCreado: ' + regCreate);
                    msgConfirmation('Registro de seguimiento creado', mensaje + ' ' + regCreate);
                    dataReturn = true;
                }
            }else{
                console.log('Error datos incompletos');
            }
        } catch (error) {
            console.log('Createrecord Error: ' + error);
            log.error({title:'createRecord', details:error});
        }
        return dataReturn;
    }

    /**
     * This function retrieves data from a Suitelet URL and populates a table with the results.
     * @param reg - The parameter "reg" is likely an object that represents a NetSuite record. The
     * function is using this object to retrieve values from specific fields on the record using the
     * "getValue" method.
     * @returns an object with a boolean property "success" and its value, which can be either true or
     * false depending on the success of the function execution.
     */
    function getRelationsOT(reg) {
        var dataReturn = {succes: false}
        try {
            var cncData = reg.getValue({fieldId: 'custom_pronest_cnc'});
            var nestData = reg.getValue({fieldId: 'custom_pronest_nest'});
            var codeData = reg.getValue({fieldId: 'custom_pronest_code'});
            var suiteletUrl = url.resolveScript({
                scriptId: 'customscript_tkio_repor_avanc_ws_sl',
                deploymentId: 'customdeploy_tkio_repor_avanc_ws_sl',
                returnExternalUrl: true,
                params: {action: 2}
            });
            // action = 2 significa buscar OT:
            console.log('suiteletURL: ' + suiteletUrl);
            var headerObj = {
                name: 'Accept-Language',
                value: 'en-us'
            };
            var response = https.post({
                url: suiteletUrl,
                body: {cnc: cncData, nest: nestData, code: codeData},
                headers: headerObj
            });
            var myresponse_body = JSON.parse(response.body); // see https.ClientResponse.body
            console.log(myresponse_body);
            if (myresponse_body.succes == true) {
                if (myresponse_body.data.length<=0) {
                    var myMsg = message.create({
                        title: 'Sin Ordenes de trabajo',
                        message: 'No se tienen ordenes de trabajo para la información ingresada',
                        type: message.Type.INFORMATION
                    });
                    myMsg.show({
                        duration: 8000 // will disappear after 5s
                    });
                    dataReturn.succes = false;
                    return dataReturn;
                }
                console.log('Insert data');
                var objTable =document.getElementById('table_result');
                objTable.style.visibility = 'visible';
                for (var line = 0; line < myresponse_body.data.length; line++) {
                    var lineTable = objTable.rows.length;
                    var row = objTable.insertRow(lineTable);
                    let otData = myresponse_body.data[line].tranid;
                    let itemData = myresponse_body.data[line].item;
                    let quantityData = myresponse_body.data[line].quantity;
                    console.log('Linea: ' + line + ' ot: ' + otData + ' item: ' + itemData + ' cantidad: ' + quantityData);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    var cell4 = row.insertCell(3);
                    var cell5 = row.insertCell(4);
                    cell1.innerHTML = otData;
                    cell2.innerHTML = itemData;
                    cell3.innerHTML = quantityData;
                    cell4.innerHTML = '<input type="number" style="width : 100%; heigth : 100%" id="cantidad_nest_'+ (line+1) +'">';
                    cell5.innerHTML = '<input type="number" style="width : 100%; heigth : 100%" id="cantidad_scrap_'+ (line+1) +'">';
                }
                dataReturn.succes = true;
            }else{
                msgError('Error al relacionar datos', myresponse_body.error);
                dataReturn.succes = false;
            }
        } catch (error) {
            console.log('getRelationsOT Error: ' + error);
            msgError('Error al buscar OT', error.message);
        }
        return dataReturn;
    }

    /**
     * This function clears specific fields and a table based on a boolean value in a NetSuite record.
     * @param datareg - The parameter "datareg" is likely a record object that contains data from a
     * NetSuite record. The function "clearFields" is using this parameter to clear certain fields on
     * the record and update their values to null.
     */
    function clearFields(datareg) {
        try {
            var myRecord = datareg;
            var clearField = myRecord.getValue({fieldId: 'custom_clear'});
            console.log('Limpiando datos y campos ## clearField: ' + clearField);
            if (clearField) {
                myRecord.setValue({
                    fieldId: 'custom_pronest_emp',
                    value: null
                });
                myRecord.setValue({
                    fieldId: 'custom_pronest_cnc',
                    value: null
                });
                myRecord.setValue({
                    fieldId: 'custom_pronest_nest',
                    value: null
                });
                myRecord.setValue({
                    fieldId: 'custom_pronest_code',
                    value: null
                });
                myRecord.setValue({
                    fieldId: 'custom_clear',
                    value: false
                });
                var objTable =document.getElementById('table_result');
                var lineTable = objTable.rows.length;
                console.log('Rows count: ' + lineTable);
                for (let line = lineTable; line > 1; line--) {
                    objTable.deleteRow(line-1);
                }
                changevisibility(myRecord);
            }
        } catch (error) {
            console.log('clearFields Error: ' + error);
        }
    }

    /**
     * The function extracts data from a table and creates a new record with the extracted data.
     */
    function joinData() {
        try {
            var myRecord = currentRecord.get();
            var clearField = myRecord.getValue({fieldId: 'custom_clear'});
            console.log('joinData clearField: ' + clearField);
            if (clearField) {
                var empleadoField = myRecord.getValue({fieldId: 'custom_pronest_emp'});
                var cncField = myRecord.getValue({fieldId: 'custom_pronest_cnc'});
                var nestField = myRecord.getValue({fieldId: 'custom_pronest_nest'});
                var centroField = myRecord.getValue({fieldId: 'custom_pronest_code'});
                var objTable =document.getElementById('table_result');
                var countLine = 0;
                var countColumn = 0;
                var cellInfo = {empleado: '', cnc: '', nest: '', centro:'', ot: '', item: '', cant_ot: '', cant_comp: '', cant_scrap: ''};
                var finalData = [];
                // Extracción de información de la tabla final
                for (let row of objTable.rows) {
                    if (countLine == 0) {
                        countLine = countLine + 1;
                        continue;
                    }
                    for (let cell of row.cells) {
                        let dato = cell.innerHTML;
                        switch (countColumn) {
                            case 0:
                                cellInfo.ot = dato;
                                break;
                            case 1:
                                cellInfo.item = dato;
                                break;
                            case 2:
                                cellInfo.cant_ot = dato;
                                break;
                        }
                        countColumn = countColumn + 1;
                    }
                    countColumn = 0;
                    let cantComp = document.getElementById('cantidad_nest_' + countLine).value;
                    let cantScrap = document.getElementById('cantidad_scrap_' + countLine).value;
                    cellInfo.cant_comp = cantComp;
                    cellInfo.cant_scrap = cantScrap;
                    cellInfo.empleado = empleadoField;
                    cellInfo.cnc = cncField;
                    cellInfo.nest = nestField;
                    cellInfo.centro = centroField;
                    console.log('CellInfo: ',cellInfo);
                    if (cantComp || cantScrap) {
                        finalData.push(cellInfo);
                    }
                    cellInfo = {empleado: '', cnc: '', nest: '', centro:'', ot: '', item: '', cant_ot: '', cant_comp: '', cant_scrap: ''}
                    countLine = countLine + 1;
                }
                if (finalData.length>0) {
                    var creacion = createRecord(finalData);
                    console.log('Join data result', creacion);
                }
                clearFields(myRecord);
            }
        } catch (error) {
            console.log('joinData Error: ' + error);
        }
    }

    /**
     * The function creates and displays an error message with a specified title and message for a
     * duration of 6 seconds.
     * @param title - The title of the error message. It should briefly describe the error that
     * occurred.
     * @param msg - The "msg" parameter is a string that represents the message to be displayed in the
     * error message. It is the actual content of the error message that will be shown to the user.
     */
    function msgError(title, msg) {
        var myMsg = message.create({
            title: title,
            message: msg,
            type: message.Type.ERROR
        });
        myMsg.show({
            duration: 6000 // will disappear after 6s
        });
    }

    /**
     * The function creates a confirmation message with a title and message, and displays it for 6
     * seconds.
     * @param title - The title of the confirmation message box. It should briefly describe the purpose
     * of the message.
     * @param msg - The message to be displayed in the confirmation dialog box. It is a string value.
     */
    function msgConfirmation(title, msg) {
        var myMsg = message.create({
            title: title,
            message: msg,
            type: message.Type.CONFIRMATION
        });
        myMsg.show({
            duration: 6000 // will disappear after 6s
        });
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {

    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        // clearFields: clearFields,
        joinData: joinData
        // postSourcing: postSourcing,
        // sublistChanged: sublistChanged,
        // lineInit: lineInit,
        // validateField: validateField,
        // validateLine: validateLine,
        // validateInsert: validateInsert,
        // validateDelete: validateDelete,
        // saveRecord: saveRecord
    };
    
});
