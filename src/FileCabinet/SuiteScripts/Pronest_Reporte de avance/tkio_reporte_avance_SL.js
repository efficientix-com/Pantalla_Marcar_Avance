/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @name tkio_reporte_avance_SL
 * @version 1.0
 * @author Dylan Mendoza <dylan.mendoza@freebug.mx>
 * @summary Pantalla para marcar el avance de la producción de las ordenes de trabajo.
 * @copyright Tekiio México 2023
 * 
 * Client              -> Fasemex
 * Last modification   -> 14/05/2023
 * Modified by         -> Dylan Mendoza <dylan.mendoza@freebug.mx>
 * Script in NS        -> ProNest Reporte de avance SL <customscript_tkio_repor_avanc_sl>
 */
define(['N/log', 'N/task', 'N/ui/serverWidget', 'N/url', 'N/https', 'N/redirect'],
    /**
 * @param{log} log
 * @param{task} task
 * @param{serverWidget} serverWidget
 */
    (log, task, ui, url, https, redirect) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */

        var response, request, params;
        const onRequest = (scriptContext) => {
            response = scriptContext.response;
            request = scriptContext.request;
            params = request.parameters;
            try {
                log.debug({title:'In function params', details:params});
                if (params.reg) {
                    log.debug({title:'probando', details:'Probando algo'});
                }else{
                    log.debug({title:'In else', details:'En el else'});
                    var formProcess = createPrincipalForm();
                    response.writePage(formProcess);
                }
            } catch (error) {
                log.error({title:'onRequest', details:error});
                var formError = createFormError('Ha ocurrido un error, contacte a su administrador.');
                response.writePage(formError);
            }
        }

        function createFormError(msg) {
            try {
                var form = ui.createForm({
                    title: 'Marcar avance'
                });
                var htmlField = form.addField({
                    id: 'custpage_msg',
                    label: ' ',
                    type: ui.FieldType.INLINEHTML
                });
                htmlField.defaultValue = "<div style='background-color: #ffe5e5; border-radius: 10px; border: 3px solid #ffb2b2; padding: 10px 35px; width:100%; height: auto;'>";
                if (!util.isArray(msg)) {
                    var aux = msg;
                    msg = [aux];
                }
                for (var i = 0; i < msg.length; i++) {
                    htmlField.defaultValue += "<p'>" +
                        "<strong style='font-size:15px;'>" +
                        msg[i] +
                        "</strong>" +
                        "</p>";
                }
                htmlField.defaultValue += "</div>";
                return form;
            } catch (error) {
                log.error({ title: 'createFormError', details: e });
                throw "Ha ocurrido un error, intente más tarde.";
            }
        }

        function createPrincipalForm() {
            var form;
            try {
                form = ui.createForm({
                    title: 'Marcar avance'
                });
                form.clientScriptModulePath = './tkio_reporte_avance_CS.js';
                var fieldGroupHeader = form.addFieldGroup({
                    id : 'custom_header',
                    label : 'Datos principales'
                });
                var empField = form.addField({
                    id: 'custom_pronest_emp',
                    type: ui.FieldType.TEXT,
                    label: 'No. de empleado',
                    container : 'custom_header'
                });
                empField.updateDisplayType({
                    displayType: ui.FieldDisplayType.NORMAL
                });
                var cncField = form.addField({
                    id: 'custom_pronest_cnc',
                    type: ui.FieldType.TEXT,
                    label: 'CNC',
                    container : 'custom_header'
                });
                cncField.updateDisplayType({
                    displayType: ui.FieldDisplayType.DISABLED
                });
                var regCreaField = form.addField({
                    id: 'custom_reg_seg',
                    type: ui.FieldType.TEXT,
                    label: 'Registro de seguimiento',
                    container : 'custom_header'
                });
                regCreaField.updateDisplayType({
                    displayType: ui.FieldDisplayType.DISABLED
                });
                var nestField = form.addField({
                    id: 'custom_pronest_nest',
                    type: ui.FieldType.TEXT,
                    label: 'NEST',
                    container : 'custom_header'
                });
                nestField.updateDisplayType({
                    displayType: ui.FieldDisplayType.DISABLED
                });
                var codeField = form.addField({
                    id: 'custom_pronest_code',
                    type: ui.FieldType.TEXT,
                    label: 'Centro de trabajo',
                    container : 'custom_header'
                });
                codeField.updateDisplayType({
                    displayType: ui.FieldDisplayType.DISABLED
                });
                var clearField = form.addField({
                    id: 'custom_clear',
                    type: ui.FieldType.CHECKBOX,
                    label: 'Limpiar',
                    container : 'custom_header'
                });
                clearField.updateDisplayType({
                    displayType: ui.FieldDisplayType.DISABLED
                });
                clearField.defaultValue = 'F';
                var btn = form.addButton({
                    id: 'custom_submitbtn',
                    label: 'Continuar',
                    functionName: 'joinData()'
                });
                log.debug({title:'btn', details:btn});
                var htmlField = form.addField({
                    id: 'custpage_result_table',
                    type: ui.FieldType.INLINEHTML,
                    label: ' '
                });
                var tableData = '</br></br>'
                tableData += '<table border="2" width=200% style="border-collapse: collapse" id="table_result">';
                tableData +=    '<tr>'
                tableData +=        '<th style="background-color: #E0E6EF"><b>No.</b></th>'
                tableData +=        '<th style="background-color: #E0E6EF"><b>Orden de trabajo</b></th>'
                tableData +=        '<th style="background-color: #E0E6EF"><b>Marca</b></th>'
                tableData +=        '<th style="background-color: #E0E6EF"><b>Cantidad en NEST</b></th>'
                tableData +=        '<th style="background-color: #E0E6EF"><b>Cantidad completada</b></th>'
                tableData +=        '<th style="background-color: #E0E6EF"><b>Cantidad Scrap</b></th>'
                tableData +=    '</tr>'
                tableData += '</table>';
                htmlField.defaultValue = tableData;
            } catch (error) {
                log.error({title:'createPrincipalForm', details:error});
                form = createFormError('Ha ocurrido un error al intentar crear la pantalla');
            }
            return form;
        }

        return {onRequest}

    });
