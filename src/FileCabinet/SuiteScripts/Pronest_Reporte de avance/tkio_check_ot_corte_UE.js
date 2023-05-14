/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @name tkio_check_ot_corte_UE
 * @version 1.0
 * @author Dylan Mendoza <dylan.mendoza@freebug.mx>
 * @summary Script para crear registros recibidos por WS.
 * @copyright Tekiio México 2023
 * 
 * Client              -> Fasemex
 * Last modification   -> 26/04/2023
 * Modified by         -> Dylan Mendoza <dylan.mendoza@freebug.mx>
 * Script in NS        -> Check OT Corte <customscript_tkio_check_ot_corte_ue>
 */
define(['N/log', 'N/record', 'N/search'],
    /**
 * @param{log} log
 * @param{record} record
 * @param{search} search
 */
    (log, record, search) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            try {
                var myRecord = scriptContext.newRecord;
                log.debug({title:'myRecord Inicio', details:myRecord});
                // if (scriptContext.UserEventType.EDIT == scriptContext.type) {
                if (scriptContext.UserEventType.CREATE == scriptContext.type) {
                    var otReg = myRecord.getValue({fieldId: 'custrecord_tkio_orden_de_trabajo'});
                    var cncReg = myRecord.getValue({fieldId: 'custrecord_tkio_cnc'});
                    var nestReg = myRecord.getValue({fieldId: 'custrecord_tkio_nest'});
                    if (otReg && cncReg && nestReg) { // crear registro para procesar
                        var otid = myRecord.getValue({fieldId: 'custrecord_tkio_orden_de_trabajo'}) || '';
                        var cantComp = myRecord.getValue({fieldId: 'custrecord_tkio_amount_good_pronest'}) || 0;
                        var cantScrap = myRecord.getValue({fieldId: 'custrecord_tkio_amount_scrap_pronest'}) || 0;
                        var cantConsum = myRecord.getValue({fieldId: 'custrecord_tkio_amount_consumed_pronest'}) || 0;
                        var cantidad = myRecord.getValue({fieldId: 'custrecord_tkio_quantity_pronest'}) || 0;
                        var dataProces =[];
                        if (cantComp && cantComp != 0) {
                            var dataInsert = {corte: true, otid: otid, cant_comp: cantComp, cant_consum: cantConsum, cantidad: cantidad};
                            dataProces = JSON.stringify(dataInsert);
                            var result = createRecordSeg(cncReg, nestReg, dataProces);
                        }
                        if (cantScrap && cantScrap != 0) {
                            var dataInsert = {corte: true, otid: otid, cant_comp: cantScrap, cant_scrap: cantScrap, cant_consum: cantConsum, cantidad: cantidad};
                            dataProces = JSON.stringify(dataInsert);
                            var result = createRecordSeg(cncReg, nestReg, dataProces);
                        }
                    }
                }
            } catch (error) {
                log.error({title:'afterSubmit', details:error});
            }
        }

        /**
         * This function creates a new record in a custom NetSuite record type with specific field
         * values and logs the result.
         * @param cncReg - It is a string value representing the CNC (Computer Numerical Control)
         * machine used in a manufacturing process.
         * @param nestReg - It is a parameter that represents the value to be set in the
         * "custrecord_tkio_seg_rep_avan_nest" field of a NetSuite custom record of type
         * "customrecord_tkio_seg_rep_avan_pronest".
         * @param dataProces - It is a variable that contains data to be inserted into a NetSuite
         * custom record. The function creates a new record of type
         * 'customrecord_tkio_seg_rep_avan_pronest' and sets various field values including the
         * 'custrecord_tkio_seg_rep_avan_info' field to
         */
        function createRecordSeg(cncReg, nestReg, dataProces) {
            try {
                log.debug({title:'dataInsert', details:dataProces});
                var newReg = record.create({
                    type: 'customrecord_tkio_seg_rep_avan_pronest',
                    isDynamic: true
                });
                newReg.setValue({
                    fieldId: 'custrecord_tkio_seg_rep_avan_emp',
                    value: 'Web-Service'
                });
                newReg.setValue({
                    fieldId: 'custrecord_tkio_seg_rep_avan_cnc',
                    value: cncReg
                });
                newReg.setValue({
                    fieldId: 'custrecord_tkio_seg_rep_avan_nest',
                    value: nestReg
                });
                newReg.setValue({
                    fieldId: 'custrecord_tkio_seg_rep_avan_code',
                    value: 'CORTE'
                });
                newReg.setValue({
                    fieldId: 'custrecord_tkio_seg_rep_avan_status',
                    value: 1
                });
                newReg.setValue({
                    fieldId: 'custrecord_tkio_origen_reg',
                    value: 1
                });
                newReg.setValue({
                    fieldId: 'custrecord_tkio_seg_rep_avan_info',
                    value: dataProces
                });
                var regCreate = newReg.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                log.audit({title:'Registro creado', details:regCreate});
            } catch (error) {
                log.error({title:'createRecordSeg', details:error});
            }
        }

        return {afterSubmit}

    });
