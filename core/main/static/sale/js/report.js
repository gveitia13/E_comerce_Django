$(function () {
  //Set active class to Sale path
  if (window.location.pathname.includes('sale'))
    changeSidebar('.my-sales', '.my-sales-reports')

  $('input[name="date_range"]')
    .daterangepicker({
      locale: {
        format: 'YYYY-MM-DD',
        applyLabel: '<i class=" mdi mdi-check-circle-outline"></i> Apply',
        cancelLabel: '<i class="mdi mdi-cancel"></i> Cancel',
      },
      maxDate: 'today',
      cancelButtonClasses: 'bg-gradient-danger circular',
      applyButtonClasses: 'bg-gradient-primary circular',
    })
    .on('apply.daterangepicker', function (ev, picker) {
      date_range = picker
      generate_report()
    })
    .on('cancel.daterangepicker', function (ev, picker) {
      $(this).data('daterangepicker').setStartDate(date_now)
      $(this).data('daterangepicker').setEndDate(date_now)
      date_range = picker
      generate_report()
    })

  generate_report()
})

let
  date_range = null,
  date_now = new moment().format('YYYY-MM-DD'),

  generate_report = function () {
    let parameters = {
      'action': 'search_report',
      'start_date': date_now,
      'end_date': date_now,
    }

    if (date_range !== null) {
      parameters['start_date'] = date_range.startDate.format('YYYY-MM-DD')
      parameters['end_date'] = date_range.endDate.format('YYYY-MM-DD')
    }

    $('#listTable').DataTable({
      responsive: true,
      autoWidth: false,
      destroy: true,
      deferRender: true,
      ajax: {
        url: location.pathname,
        type: 'POST',
        data: parameters,
        dataSrc: ""
      },
      order: false,
      paging: false,
      info: false,
      searching: false,
      dom: 'Bfrtip',
      buttons: [
        {
          extend: 'excelHtml5',
          text: 'Excel <i class="mdi mdi-file-excel"></i>',
          titleAttr: 'Excel',
          className: 'btn bg-gradient-green btn-sm max-width-70px circular-left'
        },
        {
          extend: 'pdfHtml5',
          text: 'PDF <i class="mdi mdi-file-pdf"></i>',
          titleAttr: 'PDF',
          className: 'btn bg-gradient-red btn-sm max-width-70px',
          download: 'open',
          orientation: 'landscape',
          pageSize: 'LEGAL',
          customize: function (doc) {
            doc.styles = {
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center'
              },
              subHeader: {
                fontSize: 13,
                bold: true
              },
              quote: {
                italics: true
              },
              small: {
                fontSize: 8
              },
              tableHeader: {
                bold: true,
                fontSize: 11,
                color: 'white',
                fillColor: '#2d4154',
                alignment: 'center'
              }
            }
            doc.content[1].table.widths = ['20%', '20%', '15%', '15%', '15%', '15%',]
            doc.content[1].margin = [0, 35, 0, 0]
            doc.content[1].layout = {}
            doc['footer'] = (function (page, pages) {
              return {
                columns: [
                  {
                    alignment: 'left',
                    text: ['Creation date: ', {text: date_now}]
                  },
                  {
                    alignment: 'right',
                    text: ['page ', {text: page.toString()}, ' of ', {text: pages.toString()}]
                  }
                ],
                margin: 20
              }
            })
          }
        },
        {
          extend: 'print',
          text: 'Print <i class="mdi mdi-printer"></i>',
          titleAttr: 'Print',
          className: 'btn bg-gradient-info btn-sm circular-right max-width-70px'
        },
      ],
      columnDefs: [
        {responsivePriority: 1, targets: -1},
        {responsivePriority: 2, targets: 0},
        {responsivePriority: 3, targets: 1},
        {
          targets: [-1, -2, -3],
          class: 'text-center',
          orderable: false,
          render: data => `$${parseFloat(data).toFixed(2)}`
        },
      ],
      initComplete: (settings, json) => {
        $('input[type=search]').focus()
        // setHeightTable()
      }
    })
  }