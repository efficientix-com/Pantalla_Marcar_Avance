/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @name tkio_reporte_avance_MR
 * @version 1.0
 * @author Dylan Mendoza <dylan.mendoza@freebug.mx>
 * @summary Map/Reduce para el procesamiento de los registro de seguimiento de reporte de avance.
 * @copyright Tekiio México 2023
 * 
 * Client              -> Fasemex
 * Last modification   -> 27/04/2023
 * Modified by         -> Dylan Mendoza <dylan.mendoza@freebug.mx>
 * Script in NS        -> Procesamiento reporte avance <customscript_tkio_repor_avanc_mr>
 */
define(['N/log', 'N/record', 'N/search'],
    /**
 * @param{log} log
 * @param{record} record
 * @param{search} search
 */
    (log, record, search) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            try {
                var dataReturn = [];
                var dataWS = getCorteWS();
                if (dataWS.sucess == true) {
                    for (var recordws = 0; recordws < dataWS.data.length; recordws++) {
                        dataReturn.push(dataWS.data[recordws]);
                    }
                }
                var dataUI = getActivitiesUI();
                if (dataUI.sucess == true) {
                    for (var recordui = 0; recordui < dataUI.data.length; recordui++) {
                        dataReturn.push(dataUI.data[recordui]);
                    }
                }
                log.audit({title:'getInputData datareturn', details:{long:dataReturn.length, datos: dataReturn}});
                return dataReturn;
            } catch (error) {
                log.error({title:'getInputData', details:error});
            }
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */
        const caracteres = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        var posicionActual = 0;  // valor en posición AAAAAAX
        var posicionActual1 = 0; // valor en posición AAAAAXA
        var posicionActual2 = 0; // valor en posición AAAAXAA
        var posicionActual3 = 0; // valor en posición AAAXAAA
        var posicionActual4 = 0; // valor en posición AAXAAAA
        var posicionActual5 = 0; // valor en posición AXAAAAA
        var posicionActual6 = 0; // valor en posición XAAAAAA
        var indiceConcat = '';
        const map = (mapContext) => {
            try {
                var datos=JSON.parse(mapContext.value);
                var indice =mapContext.key*1;
                indiceConcat += caracteres[posicionActual6];
                indiceConcat += caracteres[posicionActual5];
                indiceConcat += caracteres[posicionActual4];
                indiceConcat += caracteres[posicionActual3];
                indiceConcat += caracteres[posicionActual2];
                indiceConcat += caracteres[posicionActual1];
                indiceConcat += caracteres[posicionActual];
                posicionActual = posicionActual + 1;
                if (posicionActual >= caracteres.length) {
                    posicionActual = 0;
                    posicionActual1 = posicionActual1 + 1;
                }
                if (posicionActual1 >= caracteres.length) {
                    posicionActual1 = 0;
                    posicionActual2 = posicionActual2 + 1;
                }
                if (posicionActual2 >= caracteres.length) {
                    posicionActual2 = 0;
                    posicionActual3 = posicionActual3 + 1;
                }
                if (posicionActual3 >= caracteres.length) {
                    posicionActual3 = 0;
                    posicionActual4 = posicionActual4 + 1;
                }
                if (posicionActual4 >= caracteres.length) {
                    posicionActual4 = 0;
                    posicionActual5 = posicionActual5 + 1;
                }
                if (posicionActual5 >= caracteres.length) {
                    posicionActual5 = 0;
                    posicionActual6 = posicionActual6 + 1;
                }
                if (indiceConcat != '') {
                    indice = indiceConcat;
                }
                indiceConcat = '';
                mapContext.write({
                    key:indice,
                    value:datos
                });
            } catch (error) {
                log.error({title:'map', details:error});
            }
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {
            try {
                var data = JSON.parse(reduceContext.values);
                log.audit({title:'reduce Data: ' + reduceContext.key, details:data});
                updRegSeg(data.idreg, 2, '');
                var dataProcess, otid;
                dataProcess = JSON.parse(data.data);
                if (data.origen == 1) { // Viene del WS actividad corte
                    otid = dataProcess.otid;
                }else if (data.origen == 2) { // Viene de UI
                    var workorderSearchObj = search.create({
                        type: "workorder",
                        filters:
                        [
                           ["type","anyof","WorkOrd"], 
                           "AND", 
                           ["status","anyof","WorkOrd:B","WorkOrd:D"], 
                           "AND", 
                           ["numbertext","is",dataProcess.ot],
                           "AND", 
                           ["mainline","is","T"]
                        ],
                        columns:
                        [
                           search.createColumn({
                              name: "internalid",
                              sort: search.Sort.ASC,
                              label: "Internal ID"
                           }),
                           search.createColumn({name: "tranid", label: "Document Number"})
                        ]
                    });
                    workorderSearchObj.run().each(function(result){
                        otid = result.getValue({name: 'internalid'});
                        return true;
                    });
                }
                if (!dataProcess || !otid) {
                    log.error({title:'Se ingreso registro de manera manual o no hay OT en Netsuite', details:'Valdiar escenario, momentaneo error'});
                    updRegSeg(data.idreg, 4, 'Registro generado manualmente o sin OT en el sistema Error de procesamiento');
                }else{
                    log.debug({title:'Continuar', details:{otid: otid, data: dataProcess}});
                    var centro = data.centro;
                    var completion = createCompletion(dataProcess, otid, centro);
                    log.audit({title:'completion Result', details:completion});
                    if (completion.sucess == false) {
                        updRegSeg(data.idreg, 4, completion.error);
                    }else{
                        updRegSeg(data.idreg, 3, completion.resultcomp);
                    }
                }
            } catch (error) {
                log.error({title:'reduce', details:error});
                updRegSeg(data.idreg, 4, error.message);
            }
        }

        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {
            try {
                log.audit({title:'summarize', details:'Final'});
            } catch (error) {
                log.error({title:'summarize', details:error});
            }
        }


        /**
         * This function retrieves data from a NetSuite search and returns it in an array.
         * @returns The function `getCorteWS` returns an object with two properties: `success` (a
         * boolean indicating whether the function executed successfully) and `data` (an array of
         * objects containing information about records retrieved from a NetSuite search).
         */
        function getCorteWS() {
            var dataReturn = {sucess: false, data: []};
            try {
                var regByWS = search.create({
                    type: "customrecord_tkio_seg_rep_avan_pronest",
                    filters:
                    [
                        ["custrecord_tkio_seg_rep_avan_status","anyof","1","4"],
                        "AND",
                        ["custrecord_tkio_origen_reg","anyof","1"],
                        "AND",
                        ["isinactive","is","F"],
                        // "AND",
                        // ["internalid","anyof","313","614","618","722","825","826","827","1112","1111"]
                    ],
                    columns:
                    [
                       search.createColumn({
                          name: "internalid",
                          sort: search.Sort.ASC,
                          label: "ID interno"
                       }),
                       search.createColumn({name: "custrecord_tkio_seg_rep_avan_emp", label: "No. de empleado"}),
                       search.createColumn({name: "custrecord_tkio_seg_rep_avan_cnc", label: "CNC"}),
                       search.createColumn({name: "custrecord_tkio_seg_rep_avan_nest", label: "NEST"}),
                       search.createColumn({name: "custrecord_tkio_seg_rep_avan_code", label: "Centro de trabajo"}),
                       search.createColumn({name: "custrecord_tkio_seg_rep_avan_info", label: "Infromación capturada"}),
                       search.createColumn({name: "custrecord_tkio_seg_rep_avan_status", label: "Estatus"}),
                       search.createColumn({name: "custrecord_tkio_seg_rep_avan_notes", label: "Notas"}),
                       search.createColumn({name: "custrecord_tkio_origen_reg", label: "Origen"}),
                       search.createColumn({name: "created", label: "Fecha de creación"})
                    ]
                });
                var regByWSResult = regByWS.runPaged({
                    pageSize: 1000
                });
                log.debug("Registros web service",regByWSResult.count);
                var arrayReturn = [];
                if (regByWSResult.count > 0) {
                    var dataReg, idReg, origenReg, centroReg;
                    regByWSResult.pageRanges.forEach(function(pageRange){
                        var myPage = regByWSResult.fetch({index: pageRange.index});
                        myPage.data.forEach(function(result){
                            dataReg = result.getValue({name: 'custrecord_tkio_seg_rep_avan_info'});
                            idReg = result.getValue({name: 'internalid'});
                            origenReg = result.getValue({name: 'custrecord_tkio_origen_reg'});
                            centroReg = result.getValue({name: 'custrecord_tkio_seg_rep_avan_code'});
                            arrayReturn.push({"idreg": idReg, "origen": origenReg, "centro": centroReg, "data": dataReg});
                            dataReg = '';
                            idReg = '';
                            origenReg = '';
                            centroReg = '';
                        });
                    });
                }
                dataReturn.sucess = true;
                dataReturn.data = arrayReturn;
                log.debug({title:'WS array', details:arrayReturn});
            } catch (error) {
                log.error({title:'getCorteWS', details:error});
                dataReturn.sucess = false;
            }
            return dataReturn;
        }

        
        /**
         * This function retrieves data from a custom record in NetSuite and returns it in an array
         * format.
         * @returns an object with two properties: "success" and "data". The "success" property is a
         * boolean value indicating whether the function executed successfully or not. The "data"
         * property is an array of objects containing information about certain records in a custom
         * NetSuite record type.
         */
        function getActivitiesUI() {
            var dataReturn = {sucess: false, data: []};
            try {
                var regByUI = search.create({
                    type: "customrecord_tkio_seg_rep_avan_pronest",
                    filters:
                    [
                       ["custrecord_tkio_seg_rep_avan_status","anyof","1","4"], 
                       "AND", 
                       ["custrecord_tkio_origen_reg","anyof","2"], 
                       "AND", 
                       ["isinactive","is","F"],
                    //    "AND", 
                    //    ["internalid","anyof","615","1107","1106","1108","1109","1103","1102","1105"]
                    ],
                    columns:
                    [
                       search.createColumn({
                          name: "internalid",
                          sort: search.Sort.ASC,
                          label: "Internal ID"
                       }),
                       search.createColumn({name: "custrecord_tkio_seg_rep_avan_emp", label: "No. de empleado"}),
                       search.createColumn({name: "custrecord_tkio_seg_rep_avan_cnc", label: "CNC"}),
                       search.createColumn({name: "custrecord_tkio_seg_rep_avan_nest", label: "NEST"}),
                       search.createColumn({name: "custrecord_tkio_seg_rep_avan_code", label: "Centro de trabajo"}),
                       search.createColumn({name: "custrecord_tkio_seg_rep_avan_info", label: "Infromación capturada"}),
                       search.createColumn({name: "custrecord_tkio_seg_rep_avan_status", label: "Estatus"}),
                       search.createColumn({name: "custrecord_tkio_seg_rep_avan_notes", label: "Notas"}),
                       search.createColumn({name: "custrecord_tkio_origen_reg", label: "Origen"}),
                       search.createColumn({name: "created", label: "Date Created"})
                    ]
                });
                var regByUIResult = regByUI.runPaged({
                    pageSize: 1000
                });
                log.debug("Registros Pantalla",regByUIResult.count);
                var arrayReturn = [];
                if (regByUIResult.count > 0) {
                    var dataReg, idReg, origenReg, centroReg;
                    regByUIResult.pageRanges.forEach(function(pageRange){
                        var myPage = regByUIResult.fetch({index: pageRange.index});
                        myPage.data.forEach(function(result){
                            idReg = result.getValue({name: 'internalid'});
                            origenReg = result.getValue({name: 'custrecord_tkio_origen_reg'});
                            centroReg = result.getValue({name: 'custrecord_tkio_seg_rep_avan_code'});
                            dataReg = result.getValue({name: 'custrecord_tkio_seg_rep_avan_info'});
                            arrayReturn.push({"idreg": idReg, "origen": origenReg, "centro": centroReg, "data": dataReg});
                            dataReg = '';
                            idReg = '';
                            origenReg = '';
                            centroReg = '';
                        });
                    });
                }
                log.debug({title:'UI array', details:arrayReturn});
                dataReturn.sucess = true;
                dataReturn.data = arrayReturn;
            } catch (error) {
                log.error({title:'getActivitiesUI', details:error});
                dataReturn.sucess = false;
            }
            return dataReturn;
        }

        
        /**
         * This function updates the status and notes fields of a custom record in NetSuite.
         * @param idReg - The internal ID of the record to be updated in the custom record type
         * 'customrecord_tkio_seg_rep_avan_pronest'.
         * @param status - The status to be updated for a record in the custom record type
         * 'customrecord_tkio_seg_rep_avan_pronest'.
         * @param notes - The notes parameter is a string that contains any additional information or
         * comments related to the update being made to the custom record with the specified idReg.
         * This information will be stored in the 'custrecord_tkio_seg_rep_avan_notes' field of the
         * record.
         */
        function updRegSeg(idReg, status, notes) {
            try {
                log.audit({title:'infoToUpd', details:{idreg: idReg, status: status, notes: notes}});
                record.submitFields({
                    type: 'customrecord_tkio_seg_rep_avan_pronest',
                    id: idReg,
                    values: {
                       'custrecord_tkio_seg_rep_avan_status' : status,
                       'custrecord_tkio_seg_rep_avan_notes' : notes,
                    }
                });
            } catch (error) {
                log.error({title:'updRegSeg', details:error});
            }
        }

        
        /**
         * This function creates a work order completion record and sets its values based on input
         * data.
         * @param datos - It is an object containing data related to the completion of a task, such as
         * the quantity completed and whether material was consumed or not.
         * @param otid - The parameter "otid" is an identifier for a work order. It is used to retrieve
         * information about the work order and create a work order completion record.
         * @param centro - The "centro" parameter is a variable that represents the center of work to
         * be used in the completion process. It is used to determine which task in the operation
         * sequence should be completed next.
         * @returns an object with three properties: "success" (a boolean indicating whether the
         * function was successful or not), "resultcomp" (a string with information about the
         * completion task), and "error" (a string with an error message if the function encountered an
         * error).
         */
        function createCompletion(datos, otid, centro) {
            var dataReturn = {sucess: false, resultcomp: '', error: ''}
            try {
                log.debug({title:'Creando completion', details:{datos: datos, otid: otid}});
                var operationTasks = getOperationTask(otid);
                log.debug({title:'operationTasks', details:operationTasks});
                if (operationTasks.sucess == false) { // error al obtener las tareas
                    dataReturn.error = operationTasks.error;
                    return dataReturn;
                }
                var actividad = '';
                var completeOT = (operationTasks.data.length == 1) ? true : false;
                if (datos.corte) {
                    log.debug({title:'Actividad de corte', details:'Buscar secuencia con numeración 10'});
                    for (var actividadLine = 0; actividadLine < operationTasks.data.length; actividadLine++) {
                        if (operationTasks.data[actividadLine].sequence == '10') {
                            log.debug({title:'Esta es la actividad de corte', details:operationTasks.data[actividadLine]});
                            actividad = operationTasks.data[actividadLine].id;
                            break;
                        }
                    }
                }else{
                    log.debug({title:'No es corte', details:'Buscar sequencia por centro de trabajo'});
                    for (var actividadLine = 0; actividadLine < operationTasks.data.length; actividadLine++) {
                        if (operationTasks.data[actividadLine].center == centro) {
                            log.debug({title:'Esta es la actividad en linea', details:operationTasks.data[actividadLine]});
                            actividad = operationTasks.data[actividadLine].id;
                            if (actividadLine == (operationTasks.data.length - 1)) {
                                log.debug({title:'Ultima actividad de la OT', details:'Configurar detalle de inventario'});
                                completeOT = true;
                            }
                            break;
                        }
                    }
                }
                if (actividad == '') { // Si no hay actividad a utilizar arroja error
                    log.debug({title:'Actividad a realizar', details:'No hay actividades'});
                    dataReturn.error = 'No se encuentra actividad a realizar con la orden de trabajo ingresada id: ' + otid + ' y el centro de trabajo especificado';
                    return dataReturn;
                }else{
                    log.debug({title:'Actividad a realizar', details:actividad});
                    var objRecord = record.transform({
                        fromType: 'workorder',
                        fromId: otid,
                        toType: 'workordercompletion',
                        isDynamic: true,
                    });
                    if (datos.corte) { // Se consume material
                        objRecord.setValue({
                            fieldId: 'isbackflush',
                            value: true
                        });
                    }else{ // No se consume material
                        objRecord.setValue({
                            fieldId: 'isbackflush',
                            value: false
                        });
                    }
                    objRecord.setValue({
                        fieldId: 'startoperation',
                        value: actividad
                    });
                    objRecord.setValue({
                        fieldId: 'endoperation',
                        value: actividad
                    });
                    var setQuantity = datos.cant_comp || ''; // cantidad registrada
                    if (setQuantity > 0) {
                        var necessaryQuantity = objRecord.getValue({fieldId: 'orderquantity'}); // cantidad en ot necesaria
                        log.debug({title:'Cantidades', details:{set: setQuantity, orden: necessaryQuantity}});
                        if (setQuantity > necessaryQuantity) {
                            var diferencia = setQuantity - necessaryQuantity;
                            dataReturn.resultcomp += 'Se modifico la cantidad por el total completado permitido para la OT; cantidad necesaria: ' + necessaryQuantity + ', cantidad registrada: ' + setQuantity + ', diferencia de ' + diferencia + '\n\n';
                            setQuantity = necessaryQuantity;
                        }
                        objRecord.setValue({
                            fieldId: 'completedquantity',
                            value: setQuantity
                        });
                    }
                    var scrapQuantity = datos.cant_scrap || '';
                    if (scrapQuantity) {
                        objRecord.setValue({
                            fieldId: 'scrapquantity',
                            value: scrapQuantity
                        });
                        var actividadEnd = operationTasks.data[operationTasks.data.length - 1].id;
                        log.debug({title:'actividadEnd', details:actividadEnd});
                        objRecord.setValue({
                            fieldId: 'endoperation',
                            value: actividadEnd
                        });
                        var ubicacionOT = objRecord.getValue({fieldId: 'location'});
                        log.debug({title:'Set inventoryDeatil', details:'Set InventoryDetail locationID: ' + ubicacionOT});
                        var bins = getFinalBins(ubicacionOT);
                        if (bins.sucess == false) {
                            dataReturn.error = bins.error;
                            return dataReturn;
                        }
                        var inventoryDetail = objRecord.getSubrecord({
                            fieldId: 'inventorydetail'
                        });
                        inventoryDetail.selectNewLine({
                            sublistId: 'inventoryassignment'
                        });
                        inventoryDetail.setCurrentSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'binnumber',
                            value: bins.bin_scrap
                        });
                        inventoryDetail.setCurrentSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'inventorystatus',
                            value: 3
                        });
                        inventoryDetail.setCurrentSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'quantity',
                            value: setQuantity
                        });
                        inventoryDetail.commitLine({
                            sublistId: 'inventoryassignment'
                        });
                    }else{
                        log.debug({title:'validacion complete OT', details:{completeOT: completeOT, setQuantity: setQuantity}});
                        if (completeOT && setQuantity) { // se setea el detalle de inventario para el producto final
                            var ubicacionOT = objRecord.getValue({fieldId: 'location'});
                            log.debug({title:'Set inventoryDeatil', details:'Set InventoryDetail locationID: ' + ubicacionOT});
                            var bins = getFinalBins(ubicacionOT);
                            if (bins.sucess == false) {
                                dataReturn.error = bins.error;
                                return dataReturn;
                            }
                            var inventoryDetail = objRecord.getSubrecord({
                                fieldId: 'inventorydetail'
                            });
                            inventoryDetail.selectNewLine({
                                sublistId: 'inventoryassignment'
                            });
                            inventoryDetail.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'binnumber',
                                value: bins.bin_finalp
                            });
                            inventoryDetail.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'inventorystatus',
                                value: 1
                            });
                            inventoryDetail.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'quantity',
                                value: setQuantity
                            });
                            inventoryDetail.commitLine({
                                sublistId: 'inventoryassignment'
                            });
                        }
                    }
                    var idCompletion = objRecord.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                    dataReturn.sucess = true;
                    dataReturn.resultcomp += 'Tarea completada idTask: ' + idCompletion;
                    if (idCompletion) {
                        var closeOTResult = closeOT(otid);
                        log.debug({title:'closeOtResult', details:closeOTResult});
                    }
                }
            } catch (error) {
                log.error({title:'createComletion', details:error});
                dataReturn.sucess = false;
                dataReturn.error = error.message;
            }
            return dataReturn;
        }

        
        /**
         * The function retrieves manufacturing operation tasks for a given work order ID and returns
         * the data in an object.
         * @param otid - The parameter `otid` is the internal ID of a manufacturing work order, which
         * is used to search for related manufacturing operation tasks.
         * @returns an object with three properties: "success" (a boolean indicating whether the
         * function executed successfully), "data" (an array of objects containing information about
         * manufacturing operation tasks), and "error" (a string containing an error message if the
         * function encountered an error).
         */
        function getOperationTask(otid) {
            var dataReturn = {sucess: false, data: [], error: ''}
            try {
                var manufacturingoperationtaskSearchObj = search.create({
                    type: "manufacturingoperationtask",
                    filters:
                    [
                       ["workorder","anyof",otid],
                       "AND",
                       ["status","anyof","PROGRESS","NOTSTART"]
                    ],
                    columns:
                    [
                       search.createColumn({
                          name: "internalid",
                          sort: search.Sort.ASC,
                          label: "ID interno"
                       }),
                       search.createColumn({name: "sequence", label: "Secuencia de operaciones"}),
                       search.createColumn({name: "status", label: "Estado"}),
                       search.createColumn({name: "manufacturingworkcenter", label: "Centro de trabajo de fabricación"}),
                       search.createColumn({name: "inputquantity", label: "Cantidad de entrada"}),
                       search.createColumn({name: "completedquantity", label: "Cantidad completada"}),
                       search.createColumn({name: "remainingquantity", label: "Remaining Quantity"})
                    ]
                });
                var taskResults = manufacturingoperationtaskSearchObj.runPaged({
                    pageSize: 1000
                });
                log.debug("Tareas para OTid: " + otid, taskResults.count);
                if (taskResults.count > 0) { // Existen tareas a ejecutar
                    var idTask, statusTask, sequenceTask, centerTask, inputQTask, completeQTask, faltaQTask, regTask;
                    var arrayTask = [];
                    taskResults.pageRanges.forEach(function(pageRange){
                        var myPage = taskResults.fetch({index: pageRange.index});
                        myPage.data.forEach(function(result){
                            idTask = result.getValue({name: 'internalid'});
                            statusTask = result.getValue({name: 'status'});
                            sequenceTask = result.getValue({name: 'sequence'});
                            centerTask = result.getValue({name: 'manufacturingworkcenter'});
                            inputQTask = result.getValue({name: 'inputquantity'});
                            completeQTask = result.getValue({name: 'completedquantity'});
                            faltaQTask = result.getValue({name: 'remainingquantity'});
                            regTask = {id: idTask, status: statusTask, sequence: sequenceTask, center: centerTask, input: inputQTask, falt: faltaQTask, complet: completeQTask};
                            arrayTask.push(regTask);
                        });
                    });
                    if (taskResults.count == 1) { // Es la ultima o unica tarea de la OT
                        log.debug({title:'Nota importante', details:'Es la ultima o unica tarea de la OT'});
                    }
                    dataReturn.sucess = true;
                    dataReturn.data = arrayTask;
                }else{ // no hay tareas pendientes
                    dataReturn.sucess = false;
                    dataReturn.error = 'No se cuenta con operaciones pendientes de ejecutar para la OT con id: ' + otid;
                }
            } catch (error) {
                log.error({title:'getOperationTask', details:error});
                dataReturn.sucess = false;
                dataReturn.error = error;
            }
            return dataReturn;
        }

        
        /**
         * This function retrieves the final product bin and scrap product bin for a given location.
         * @param location - The parameter "location" is the internal ID of a NetSuite location record.
         * The function uses this ID to look up and retrieve the values of two custom fields
         * ("custrecord111" and "custrecord112") that represent the final product bin and scrap product
         * bin for that location. The function then
         * @returns an object with the following properties: "success" (a boolean indicating whether
         * the function executed successfully), "bin_finalp" (a string representing the value of the
         * "custrecord111" field for the specified location), "bin_scrap" (a string representing the
         * value of the "custrecord112" field for the specified location), and "error" (a string
         * representing
         */
        function getFinalBins(location) {
            var dataReturn = {sucess: false, bin_finalp: '', bin_scrap: '', error: ''};
            try {
                var datosUbicacion = search.lookupFields({
                   type: search.Type.LOCATION,
                   id: location,
                   columns: ['custrecord111', 'custrecord112']
                });
                log.debug({title:'Datos de la ubicación id: ' + location, details:datosUbicacion});
                var binFinalProduct = datosUbicacion.custrecord111[0].value || '';
                var binScrapProduct = datosUbicacion.custrecord112[0].value || '';
                dataReturn.bin_finalp = binFinalProduct;
                dataReturn.bin_scrap = binScrapProduct;
                dataReturn.sucess = true;
            } catch (error) {
                log.error({title:'getFinalBins', details:error});
                dataReturn.sucess = false;
                dataReturn.error = 'No se encuentran configurados los bins en la ubicación id: ' + location + ' Campos "BIN PT" y "BIN SCRAP"';
            }
            return dataReturn;
        }


        /**
         * The function "closeOT" closes a work order if there are no pending manufacturing operation
         * tasks associated with it.
         * @param otid - The parameter "otid" is the internal ID of a work order record in NetSuite. It
         * is used to search for manufacturing operation tasks associated with the work order and to
         * transform the work order into a work order close record once all the tasks are completed.
         * @returns an object with three properties: "success" (a boolean indicating whether the
         * function executed successfully), "ot_cerrada" (a string containing the ID of the closed work
         * order, if applicable), and "error" (a string containing an error message, if the function
         * encountered an error).
         */
        function closeOT(otid) {
            var dataReturn = {sucess: false, ot_cerrada: '', error: ''}
            try {
                log.debug({title:'closeOt Inicio', details:otid});
                var manufacturingoperationtaskSearchObj = search.create({
                    type: "manufacturingoperationtask",
                    filters:
                    [
                       ["workorder","anyof",otid],
                       "AND", 
                       ["status","anyof","PROGRESS","NOTSTART"]
                    ],
                    columns:
                    [
                       search.createColumn({
                          name: "internalid",
                          sort: search.Sort.ASC,
                          label: "ID interno"
                       }),
                       search.createColumn({name: "status", label: "Estado"}),
                       search.createColumn({name: "sequence", label: "Secuencia de operaciones"}),
                       search.createColumn({name: "manufacturingworkcenter", label: "Centro de trabajo de fabricación"}),
                       search.createColumn({name: "inputquantity", label: "Cantidad de entrada"}),
                       search.createColumn({name: "completedquantity", label: "Cantidad completada"}),
                       search.createColumn({name: "remainingquantity", label: "Cantidad restante"})
                    ]
                });
                var searchResultCount = manufacturingoperationtaskSearchObj.runPaged().count;
                log.debug("manufacturingoperationtaskSearchObj faltantes",searchResultCount);
                if (searchResultCount == 0) { // no hay actividades pendientes, se cierra la OT
                    var objRecord = record.transform({
                        fromType: 'workorder',
                        fromId: otid,
                        toType: 'workorderclose',
                        isDynamic: true,
                    });
                    var closeOtRecord = objRecord.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                    dataReturn.ot_cerrada = closeOtRecord
                }
                dataReturn.sucess = true;
            } catch (error) {
                log.error({title:'closeOT', details:error});
                dataReturn.sucess = false;
                dataReturn.error = error.message;
            }
            return dataReturn;
        }

        return {getInputData, map, reduce, summarize}

    });
