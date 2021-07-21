let
  listTableProduct,
  listTableSearchProducts,
  formatRepo = repo => {
    if (repo.loading)
      return repo.text

    if (!Number.isInteger(repo.id))
      return repo.text

    return $(`
      <div class="wrapper container">
          <div class="row">
              <div class="col-2">
                  <img src="${repo.image}" class="img-fluid img-thumbnail d-block mx-auto rounded">
              </div>
              <div class="col-10 text-left shadow-sm">
                  <p style="margin-bottom: 0;">
                      <b>Name: </b> ${repo.full_name} <br>
                      <b>Stock:</b> ${repo.stock} <br>
                      <b>Price:</b> <span class="badge badge-warning">$ ${repo.s_price}</span>
                  </p>
              </div>
          </div>
      </div>`);
  },
  Sale = {
    items: {
      cli: '',
      date_joined: '',
      subtotal: 0.00,
      iva: 0.00,
      total: 0.00,
      products: []
    },
    get_ids: function () {
      let ids = []
      this.items.products.forEach(value => {
        ids.push(value.id)
      })
      return ids
    },
    calculate_invoice: function () {
      let subtotal = 0.00,
        iva = $('input[name="iva"]').val()
      this.items.products.forEach(e => {
        e.subtotal = e.cant * parseFloat(e.s_price)
        subtotal += e.subtotal
      })
      this.items.subtotal = subtotal
      this.items.iva = this.items.subtotal * iva
      this.items.total = this.items.subtotal + this.items.iva

      $('input[name="subtotal"]').val('$ ' + this.items.subtotal.toFixed(2))
      $('input[name="ivacalc"]').val('$ ' + this.items.iva.toFixed(2))
      $('input[name="total"]').val('$ ' + this.items.total.toFixed(2))
    },
    add: function (item) {
      Sale.items.products.push(item)
      Sale.list()
    },
    list: function () {
      this.calculate_invoice()
      listTableProduct = $('#listTableProduct').DataTable({
        responsive: true,
        autoWidth: false,
        destroy: true,
        data: this.items.products,
        columns: [
          {"data": "id"},
          {"data": "full_name"},
          {"data": "stock"},
          {"data": "s_price"},
          {"data": "cant"},
          {"data": "subtotal"},
        ],
        columnDefs: [{
          targets: [-4],
          class: 'text-center',
          render: function (data, type, row) {
            return `<span class="badge badge-secondary"> ${data}</span>`
          }
        },
          {
            targets: [0],
            class: 'text-center',
            orderable: false,
            render: (data, type, row) => {
              return `<a rel="remove" class="btn bg-gradient-danger btn-xs text-white">
                          <i class="mdi mdi-trash-can-outline mdi-15px"></i></a>`
            }
          },
          {
            targets: [-3, -1],
            class: 'text-center',
            orderable: false,
            render: (data, type, row) => {
              return `$ ${parseFloat(data).toFixed(2)}`
            }
          },
          {
            targets: [-2],
            class: 'text-center',
            orderable: false,
            render: (data, type, row) => {
              return `<input type="text" name="cant" class="form-control form-control-sm input-sm" 
                                    autocomplete="off" value="${row.cant}" style="text-align: center">`
            }
          }
        ],
        rowCallback(row, data, displayNum, displayIndex, dataIndex) {
          $(row).find('input[name="cant"]').TouchSpin({
            min: 1,
            max: data.stock,
            step: 1,
          })
        },
        initComplete: (settings, json) => {
        },
      });
      // console.clear()
      console.log(this.items)
      console.log(this.get_ids())
    },
  }

$(function () {
  $('.select2').select2({
    theme: "bootstrap4",
    language: 'en'
  })

  if (window.location.pathname.includes('sale')) {
    changeSidebar('.my-sales', '.my-sales-add')
  }

  $("input[name='iva']").TouchSpin({
    min: 0,
    max: Number.POSITIVE_INFINITY,
    boostat: 5,
    maxboostedstep: 10,
    step: 0.01,
    decimals: 2,
    buttondown_class: 'btn bg-gradient-secondary',
    buttonup_class: 'btn bg-gradient-secondary'
  }).on('change', function () {
    if (parseFloat(this.value) === 0) {
      this.parentElement.children[0].children[0].classList.remove('bg-gradient-secondary')
      this.parentElement.children[0].children[0].classList.add('bg-gradient-danger')
      this.classList.add('w3-text-red')
    }
    if (parseFloat(this.value) !== 0) {
      this.parentElement.children[0].children[0].classList.remove('bg-gradient-danger')
      this.parentElement.children[0].children[0].classList.add('bg-gradient-secondary')
      this.classList.remove('w3-text-red')
    }
    Sale.calculate_invoice()
  }).val(0.15)

  $('#id_date_joined').datepicker({
    todayHighlight: true,
    autoclose: true,
    format: 'yyyy-mm-dd',
    endDate: 'today',
    clearBtn: true,
    startDate: '1920-1-1',
  })

  $('#id_date_birthday').datepicker({
    todayHighlight: true,
    autoclose: true,
    format: 'yyyy-mm-dd',
    endDate: 'today',
    clearBtn: true,
    startDate: '1920-1-1',
  })

  $('#myModalSearchProducts').on('shown.bs.modal', function () {
    // $('input[name="table_search"]').focus();
    $('#listTableSearchProducts_filter label input[type=search]').focus()
  })

  $('.btnAddClient').on('click', function () {
    $('#myModalClient').modal('show');
    $('#myModalFormClient').trigger('reset');
  })

  //event cant
  $('#listTableProduct tbody')
    .on('click', 'a[rel="remove"]', function () {
      let tr = listTableProduct.cell($(this).closest('td, li')).index()//coge el index
      Sale.items.products.splice(tr.row, 1)//seriedad
      Sale.list()
    })
    .on('change', 'input[name="cant"]', function () {
      let tr = listTableProduct.cell($(this).closest('td, li')).index()
      Sale.items.products[tr.row].cant = parseInt($(this).val())
      Sale.calculate_invoice()
      $('td:eq(5)', listTableProduct.row(tr.row).node())
        .html(`$ ${Sale.items.products[tr.row].subtotal.toFixed(2)}`)
    })

  // $('.btnClearSearch').on('click', function () {
  //   $('input[name="search"]').val('').focus();
  // })

  $('#btnSearchProduct').on('click', function () {
    listTableSearchProducts = $('#listTableSearchProducts').DataTable({
      responsive: true,
      autoWidth: false,
      destroy: true,
      deferRender: true,
      ajax: {
        url: window.location.pathname,
        type: 'POST',
        data: {
          'action': 'list_products',
          'ids': JSON.stringify(Sale.get_ids()),
          // 'term': $('select[name="search"]').val()
        },
        dataSrc: ""
      },
      columns: [
        {"data": "full_name"},
        {"data": "image"},
        {"data": "stock"},
        {"data": "s_price"},
        {"data": "id"},
      ],
      columnDefs: [
        {
          targets: [-4],
          class: 'text-center',
          orderable: false,
          render: (data, type, row) => {
            return `<img src="${data}" class="img-fluid d-block mx-auto" style="width: 20px; height: 20px;">`
          }
        },
        {
          targets: [-3],
          class: 'text-center',
          render: (data, type, row) => {
            return `<span class="badge badge-secondary"> ${data}</span>`
          }
        },
        {
          targets: [-2],
          class: 'text-center',
          orderable: false,
          render: (data, type, row) => {
            return '$' + parseFloat(data).toFixed(2)
          }
        },
        {
          targets: [-1],
          class: 'text-center',
          orderable: false,
          render: (data, type, row) => {
            return '<a rel="add" class="btn bg-gradient-success btn-xs"><i class="mdi mdi-plus mdi-15px"></i></a>'
          }
        },
      ],
      initComplete: function (settings, json) {
      },
    })
    $('#myModalSearchProducts').modal('show')
  })

  $('#listTableSearchProducts tbody')
    .on('click', 'a[rel="add"]', function () {
      let tr = listTableSearchProducts.cell($(this).closest('td, li')).index(),
        product = listTableSearchProducts.row(tr.row).data()
      product.cant = 1
      product.subtotal = 0.00
      Sale.add(product)
      listTableSearchProducts.row($(this).parents('tr')).remove().draw() //elimina la fila
    })

  $('.btnClean').on('click', () => {
    if (Sale.items.products.length === 0) return false
    alert_action('Clean up',
      'Do you want to delete all products from the table?',
      () => {
        Sale.items.products = []
        Sale.list()
      }, () => {
      }, 'mdi mdi-trash-can-outline')
  })

  // buscar clientes
  $('select[name="cli"]').select2({
    theme: "bootstrap4",
    language: 'es',
    allowClear: true,
    ajax: {
      delay: 250,
      type: 'POST',
      url: window.location.pathname,
      data: (params) => {
        return {
          term: params.term,
          action: 'search_clients'
        };
      },
      processResults: (data) => {
        return {
          results: data
        }
      },
    },
    placeholder: 'Find a client',
    minimumInputLength: 1,
  })

  //Autocomplete con Select2 ta x gusto
  $('select[name="search"]').select2({
    theme: "bootstrap4",
    language: 'es',
    allowClear: true,
    ajax: {
      delay: 250,
      type: 'POST',
      url: window.location.pathname,
      data: (params) => {
        return {
          term: params.term,
          action: 'search_autocomplete',
          ids: JSON.stringify(Sale.get_ids())
        };
      },
      processResults: (data) => {
        return {
          results: data
        }
      },
    },
    placeholder: 'Find products',
    minimumInputLength: 1,
    templateResult: formatRepo,
  }).on('select2:select', function (e) {//cuando selecciona
    let data = e.params.data
    if (!Number.isInteger(data.id))
      return false  //ni idea
    data.cant = 1
    data.subtotal = 0.00
    Sale.add(data)
    $(this).val('').trigger('change.select2')
  });

  $('#myModalFormClient').on('submit', function (e) {
    e.preventDefault()
    let parameters = new FormData(this)
    parameters.append('action', 'create_client')
    submit_with_ajax(location.pathname, parameters, (data) => {
      let newOption = new Option(data['full_name'], data['id'], false, true)
      $('select[name="cli"]').append(newOption).trigger('change')
      $('#myModalClient').modal('hide')
      Toast(`Client: ${data['name']} has been added to the database`)
    })
  })

  $('#formSale').on('submit', function (e) {
    e.preventDefault()

    if (Sale.items.products.length === 0) {
      message_error('You must have at least one item in your sale detail')
      return false
    }
    Sale.items.date_joined = $('#id_date_joined').val()
    Sale.items.cli = $('#id_cli').val()

    let parameters = new FormData()
    parameters.append('action', $('input[name="action"]').val())
    parameters.append('sale', JSON.stringify(Sale.items))

    let icon = 'mdi mdi-square-edit-outline'
    if ($('input[name="action"]').val() === 'add')
      icon = 'mdi mdi-plus-circle-outline'
    submit_with_ajax_alert(
      location.pathname, title,
      'Are you sure you save the sale record?',
      parameters,
      (response) => {
        alert_action('Print', 'Do you want to print the sale ballot?',
          () => {
            window.open(`/main/sale/invoice/pdf/${response.id}/`, '_blank')
            location.href = '/main/sale/'
          }, () => {
            location.href = '/main/sale/'
          })
      }, icon
    )
  })
  Sale.list()
})
