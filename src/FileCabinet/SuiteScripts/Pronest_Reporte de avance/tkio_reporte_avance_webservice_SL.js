/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @name tkio_resporte_avance_webservice_SL
 * @version 1.0
 * @author Dylan Mendoza <dylan.mendoza@freebug.mx>
 * @summary Suitlet para el funcionamiento como servicio para consultar y crear datos en Netsuite
 * @copyright Tekiio México 2023
 * 
 * Client              -> Fasemex
 * Last modification   -> 14/05/2023
 * Modified by         -> Dylan Mendoza <dylan.mendoza@freebug.mx>
 * Script in NS        -> ProNest Servicio para reporte <customscript_tkio_repor_avanc_ws_sl>
 */
define(['N/log', 'N/record', 'N/search'],
    /**
 * @param{log} log
 * @param{record} record
 */
    (log, record, search) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try {
                log.debug({title:'Consumo de servicio', details:'Inicio'});
                var request = scriptContext.request;
                var response = scriptContext.response;
                var params = request.parameters;
                log.debug({title:'params', details:params});
                log.debug({title:'Petición', details:request.method});
                if (request.method == 'POST') {
                    if (params.action == 1) { // crear Registro
                        var data = JSON.parse(params.data);
                        var regCreated = [];
                        log.debug({title:'Crenado registro', details:data});
                        for (var lineReg = 0; lineReg < data.length; lineReg++) {
                            var dataReg = data[lineReg];
                            log.debug({title:'Data in line ' + lineReg, details:dataReg});
                            if (dataReg.cant_comp && dataReg.cant_comp != 0) { // se crea registro para complecion bien
                                var regCreateResult = createRecordSeg(dataReg, 1);
                                if (regCreateResult.succes == true) {
                                    regCreated.push(regCreateResult.regCreated);
                                }
                            }
                            if (dataReg.cant_scrap && dataReg.cant_scrap != 0) { // se crea registro para complecion scrap
                                var regCreateResult = createRecordSeg(dataReg, 2);
                                if (regCreateResult.succes == true) {
                                    regCreated.push(regCreateResult.regCreated);
                                }
                            }
                        }
                        log.debug({title:'Registros creados', details:regCreated});
                        var result = {regCreate: regCreated}
                        if (regCreated.length>0) {
                            response.writeLine({output: JSON.stringify(result)});
                        }
                    } else if(params.action == 2){ // buscar OT
                        var resultData = {succes: false, data: [], error: ''}
                        var cncData = params.cnc;
                        var nestData = params.nest;
                        var codeData = params.code;
                        var customrecord_tkio_deposito_datos_pronestSearchObj = search.create({
                            type: "customrecord_tkio_deposito_datos_pronest",
                            filters:
                            [
                               ["custrecord_tkio_cnc","is",cncData], 
                               "AND", 
                               ["custrecord_tkio_nest","is",nestData]
                            ],
                            columns:
                            [
                               search.createColumn({
                                  name: "internalid",
                                  sort: search.Sort.ASC,
                                  label: "ID interno"
                               }),
                               search.createColumn({name: "custrecord_tkio_orden_de_trabajo", label: "Orden de Trabajo"}),
                               search.createColumn({name: "custrecord_tkio_cnc", label: "CNC"}),
                               search.createColumn({name: "custrecord_tkio_nest", label: "NEST"}),
                               search.createColumn({name: "custrecord_tkio_quantity_pronest", label: "Quantity"}),
                               search.createColumn({name: "custrecord_tkio_amount_consumed_pronest", label: "Amount Consumed"}),
                               search.createColumn({name: "custrecord_tkio_amount_scrap_pronest", label: "Amount Scrap"}),
                               search.createColumn({name: "custrecord_tkio_amount_good_pronest", label: "Amount Goods"})
                            ]
                        });
                        var dataOt = [];
                        var otFound = [];
                        var cantAux = [];
                        var myPagedData1 = customrecord_tkio_deposito_datos_pronestSearchObj.runPaged({
                            pageSize: 1000
                        });
                        log.debug("Resultados de registro WS",myPagedData1.count);
                        if (myPagedData1.count > 0) {
                            myPagedData1.pageRanges.forEach(function(pageRange){
                                var myPage = myPagedData1.fetch({index: pageRange.index});
                                myPage.data.forEach(function(result){
                                    var otId = result.getValue({name: 'custrecord_tkio_orden_de_trabajo'});
                                    if (otId) {
                                        dataOt.push(result.getValue({name: 'custrecord_tkio_orden_de_trabajo'}));
                                        cantAux.push({otid: result.getValue({name: 'custrecord_tkio_orden_de_trabajo'}), amountgoods: result.getValue({name: 'custrecord_tkio_amount_good_pronest'})});
                                    }
                                });
                            });
                            log.debug({title:'OT encontradas en reg WS', details:dataOt});
                        }else{
                            log.debug("No hay registros WS",'No se tienen registros con el nest y cnc ingresados');
                            resultData.succes = false;
                            resultData.error = 'No hay registros con el cnc y nest ingresado';
                            response.writeLine({output: JSON.stringify(resultData)});
                            return;
                        }
                        var convertCodeData = codeData*1;
                        codeData = parseInt(convertCodeData);
                        if (!codeData) {
                            log.debug("Centro de trabajo erroneo");
                            resultData.succes = false;
                            resultData.error = 'Error con el centro de trabajo ingresado, revisar datos';
                            response.writeLine({output: JSON.stringify(resultData)});
                            return;
                        }

                        var workorderSearchObj = search.create({
                            type: search.Type.WORK_ORDER,
                            filters:
                            [
                               ["status","anyof","WorkOrd:D","WorkOrd:B"], 
                               "AND", 
                               ["manufacturingrouting","noneof","@NONE@"], 
                               "AND", 
                               ["manufacturingoperationtask.manufacturingworkcenter","anyof",codeData],
                               "AND", 
                                ["internalid","anyof",dataOt]
                            ],
                            columns:
                            [
                               search.createColumn({
                                  name: "internalid",
                                  sort: search.Sort.ASC,
                                  label: "ID interno"
                               }),
                               search.createColumn({name: "tranid", label: "Número de documento"}),
                               search.createColumn({name: "item", label: "Artículo"}),
                               search.createColumn({name: "quantity", label: "Cantidad"}),
                               search.createColumn({name: "manufacturingrouting", label: "Enrutamiento de fabricación"}),
                               search.createColumn({
                                  name: "inputquantity",
                                  join: "manufacturingOperationTask",
                                  label: "Cantidad de entrada"
                               }),
                               search.createColumn({
                                  name: "completedquantity",
                                  join: "manufacturingOperationTask",
                                  label: "Cantidad completada"
                               }),
                               search.createColumn({
                                name: "sequence",
                                join: "manufacturingOperationTask",
                                label: "Secuencia de operaciones"
                             })
                             ]
                        });
                        var myPagedData = workorderSearchObj.runPaged({
                            pageSize: 1000
                        });
                        log.debug("OT con Centro de trabajo relacionado",myPagedData.count);
                        var idTran, itemTran, cantTran, cantEntTran, cantCompTran, centro, idWo;
                        var banderaCentro = false;
                        myPagedData.pageRanges.forEach(function(pageRange){
                            var myPage = myPagedData.fetch({index: pageRange.index});
                            myPage.data.forEach(function(result){
                                cantTran = null;
                                idWo = result.getValue({
                                    name: 'internalid'
                                });
                                for (var amountLine = 0; amountLine < cantAux.length; amountLine++) {
                                    if (idWo == cantAux[amountLine].otid) {
                                        cantTran = cantAux[amountLine].amountgoods;
                                    }
                                }
                                idTran = result.getValue({
                                    name: 'tranid'
                                });
                                itemTran = result.getText({
                                    name: 'item'
                                });
                                if (cantTran == null) {
                                    cantTran = result.getValue({
                                        name: 'quantity'
                                    });
                                }
                                cantEntTran = result.getValue({
                                    name: "inputquantity",
                                    join: "manufacturingOperationTask"
                                });
                                cantCompTran = result.getValue({
                                    name: "completedquantity",
                                    join: "manufacturingOperationTask"
                                });
                                centro = result.getValue({
                                    name: "sequence",
                                    join: "manufacturingOperationTask"
                                });
                                if (centro == '10') {
                                    banderaCentro = true;
                                }
                                log.debug({title:'DatosResponse', details:{tranid: idTran, item: itemTran, quantity: cantTran, cant_ent: cantEntTran, cant_comp: cantCompTran}});
                                otFound.push({tranid: idTran, item: itemTran, quantity: cantTran, cant_ent: cantEntTran, cant_comp: cantCompTran});
                            });
                        });
                        if (banderaCentro) { // se agrego el centro de trabajo de corte
                            log.debug("Centro de trabajo erroneo");
                            resultData.succes = false;
                            resultData.error = 'Error con el centro de trabajo ingresado, valide que no sea centro de corte';
                            response.writeLine({output: JSON.stringify(resultData)});
                            return;
                        }
                        resultData.data = otFound
                        resultData.succes = true;
                        response.writeLine({output: JSON.stringify(resultData)});
                    }
                }
            } catch (error) {
                log.error({title:'onRequest', details:error});                
            }
        }

        /**
         * This function creates a new record in a custom NetSuite record type with specified field
         * values and returns a success status and the ID of the created record.
         * @param dataReg - It is an object containing the data to be set in the fields of a NetSuite
         * custom record. The fields include employee, cnc, nest, centro, ot, item, cant_ot, cant_comp,
         * and cant_scrap.
         * @param opcion - The "opcion" parameter is a variable that determines the type of completion
         * being recorded. It is used to set different values in the "infoSet" object based on whether
         * the completion is for a successful production ("opcion == 1") or for a production with scrap
         * ("opcion == 2").
         * @returns an object with three properties: "success" (a boolean indicating whether the record
         * creation was successful or not), "regCreated" (the ID of the created record if successful,
         * or an empty string if not), and "error" (an error message if the record creation was not
         * successful, or an empty string if it was).
         */
        function createRecordSeg(dataReg, opcion) {
            var dataReturn = {succes: false, regCreated: '', error: ''}
            try {
                var newReg = record.create({
                    type: 'customrecord_tkio_seg_rep_avan_pronest',
                    isDynamic: true
                });
                newReg.setValue({
                    fieldId: 'custrecord_tkio_seg_rep_avan_emp',
                    value: dataReg.empleado
                });
                newReg.setValue({
                    fieldId: 'custrecord_tkio_seg_rep_avan_cnc',
                    value: dataReg.cnc
                });
                newReg.setValue({
                    fieldId: 'custrecord_tkio_seg_rep_avan_nest',
                    value: dataReg.nest
                });
                newReg.setValue({
                    fieldId: 'custrecord_tkio_seg_rep_avan_code',
                    value: dataReg.centro
                });
                if (opcion == 1) { // complecion bien
                    var infoSet = {ot: dataReg.ot, item: dataReg.item, cant_ot: dataReg.cant_ot, cant_comp: dataReg.cant_comp};
                }
                if (opcion == 2) { // complecion scrap
                    var infoSet = {ot: dataReg.ot, item: dataReg.item, cant_ot: dataReg.cant_ot, cant_comp: dataReg.cant_scrap, cant_scrap: dataReg.cant_scrap};
                }
                infoSet = JSON.stringify(infoSet);
                newReg.setValue({
                    fieldId: 'custrecord_tkio_seg_rep_avan_info',
                    value: infoSet
                });
                newReg.setValue({
                    fieldId: 'custrecord_tkio_seg_rep_avan_status',
                    value: 1
                });
                newReg.setValue({
                    fieldId: 'custrecord_tkio_origen_reg',
                    value: 2
                });
                var regCreate = newReg.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                dataReturn.regCreated = regCreate;
                dataReturn.succes = true;
            } catch (err) {
                log.error({title:'createRecordSeg', details:err});
                dataReturn.succes = false;
                dataReturn.error = err;
            }
            return dataReturn;
        }

        return {onRequest}

    });
