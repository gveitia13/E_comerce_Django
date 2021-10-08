let tableSale,
  listar = function () {
    tableSale = $('#listTable').DataTable({
      scrollX: false,
      autoWidth: false,
      responsive: true,
      destroy: true,
      deferRender: true,
      searching: true,
      paginate: false,
      buttons: buttonsDataTable([0, 1, 2, 3, 4]),
      dom: '<"row"<"col-sm-5"B><"col-sm-7"fr>>t<"row"<"col-sm-5"i><"col-sm-7"p>>',
      ajax: {
        url: location.pathname,
        type: 'POST',
        data: {
          'action': 'searchdata'
        },
        dataSrc: ""
      },
      columns: [
        {'data': 'cli.name'},
        {'data': 'date_joined'},
        {'data': 'subtotal'},
        {'data': 'iva'},
        {'data': 'total'},
        {'data': 'id'},
      ],
      columnDefs: [
        {responsivePriority: 1, targets: 0},
        {responsivePriority: 2, targets: -1},
        {responsivePriority: 3, targets: -2},
        {
          targets: [-3, -2, -4],
          class: 'text-center',
          orderable: false,
          render: data => `$ ${parseFloat(data).toFixed(2)}`
        },
        {
          targets: [1],
          class: 'text-center'
        },
        {
          targets: [-1],
          class: 'text-center pr-0',
          orderable: false,
          render: (data, type, row) => `
            <a rel="details" class="btn bg-gradient-teal btn-xs">
                <i class="mdi mdi-magnify-plus mdi-15px w3-text-black"></i></a>
            <a href="/main/sale/update/${row.id}/" class="btn bg-gradient-warning btn-xs">
                <i class="mdi mdi-square-edit-outline mdi-15px"></i></a>
            <a href="/main/sale/invoice/pdf/${row.id}/" target="_blank" 
                class="btn bg-gradient-info btn-xs">
                <i class="mdi mdi-file-pdf mdi-15px"></i></a>
            <a rel="delete" class="btn bg-gradient-danger btn-xs">
                <i class="mdi mdi-trash-can-outline mdi-15px text-white"></i></a>`
        },
      ],
      initComplete: function (settings, json) {
        $('input[type=search]').focus()
        // $('#searchInput').focus()
        setHeightTable()
        tableSale.responsive.recalc()
        tableSale.columns.adjust()
      },
    })
  }

$(function () {
  //Set active class to Sale path
  if (window.location.pathname.includes('sale'))
    changeSidebar('.my-sales', '.my-sales-sales')

  listar()

  $('#myModalDet').on('shown.bs.modal', () => {
    $('#tblDet_filter label input[type=search]').focus()
    detTable.responsive.recalc()
    detTable.columns.adjust()
  })

  $('#listTable tbody').on('click', 'a[rel="delete"]', function () {
    let tr = tableSale.cell($(this).closest('td, li')).index(),
      data = tableSale.row(tr.row).data(),
      parameters = new FormData()
    parameters.append('action', 'delete')
    parameters.append('id', data.id)
    submit_with_ajax_alert(location.pathname, 'Delete!',
      'Are you sure you want to delete the <b>' + data.cli.name + '</b> shopping record?',
      parameters,
      response => {
        listar()
        Toast(`The sale record of ${response['object']['cli']['name']} was ${response['success']}`)
      },
      'mdi mdi-alert-octagram text-danger')
  })

  $(`#listTable tbody`).on('click', 'a[rel="details"]', function () {
    let tr = tableSale.cell($(this).closest('td, li')).index(),
      data = tableSale.row(tr.row).data()
    // console.log(data)

    detTable = $('#tblDet').DataTable({
      responsive: true,
      // scrollX: true,
      autoWidth: false,
      destroy: true,
      deferRender: true,
      ajax: {
        url: window.location.pathname,
        type: 'POST',
        data: {
          'action': 'search_details-prod',
          'id': data.id,
        },
        dataSrc: ""
      },
      columns: [
        {"data": "prod.name"},
        {"data": "prod.cat.name"},
        {"data": "price"},
        {"data": "cant"},
        {"data": "subtotal"},
      ],
      columnDefs: [
        {
          targets: [-1, -3],
          class: 'text-center',
          render: data => '$ ' + parseFloat(data).toFixed(2)
        },
        {
          targets: [-2],
          class: 'text-center',
          render: data => data
        },
      ],
      initComplete: function (settings, json) {
      },
    })
    $('#myModalDet').modal('show')
  })
})