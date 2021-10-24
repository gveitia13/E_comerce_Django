$(function () {
  document.querySelectorAll('a').forEach(e => e.classList.remove('active'))
  document.querySelector('.startpage').className += ' active'

  Cart.list()
  Cart.items.prodsList = getAllProducts()

  //Buscando en tiempo real
  d.querySelector('.formHeader input').addEventListener('input', function () {
    setTimeout(() => {
      let productos = Array.from(d.querySelectorAll('span.prodName')).map(
        e => e.innerText
      )
      d.querySelectorAll('div.div-card span').forEach(f => {
        let str = removeAcents(f.innerText.toLowerCase())
        if (!str.includes(this.value.toLowerCase())) {
          f.parentElement.classList.remove(
            'd-md-inline-block',
            'd-sm-inline-block')
          f.parentElement.classList.add('d-none')
        } else {
          f.parentElement.classList.add(
            'd-md-inline-block',
            'd-sm-inline-block')
          f.parentElement.classList.remove('d-none')
        }
      })
    }, 250)
  })

  //Obteniendo detalles del producto por ajax
  d.querySelectorAll('div.prod-card').forEach(e =>
    e.addEventListener('click', function (f) {

      if (f.target.closest('button.prod-id')) return

      let parameters = new FormData()
      parameters.append('action', 'getProd')
      parameters.append('id', this.id)
      // let data = Cart.items.prods.concat(Cart.items.prodsList).find(e => e.id === this.id)

      ajaxFunction(location.pathname, parameters, data => {
        $('#prodDetails h5.name').html(`<b>${data['full_name']}</b>`)
        $('#prodDetails span.stock').html(` Stock: ${data['stock']}`)
        $('#prodDetails p.desc').text(`${data['desc']}`)
        $('#prodDetails span.price').html(`<b>${data['s_price']}</b> CUP`)
        d.querySelector(
          '#prodDetails div.imgProdDetails'
        ).style = `background: url('${data['image']}');background-color:#333;`
        d.querySelector('#prodDetails button.prod-id').name = this.id
      })
      $('#prodDetails').modal('show')
    })
  )

  d.querySelector('a[rel="contact"]').addEventListener('click', () =>
    $('#contact').modal('show')
  )

  //Eliminar de la tabla del carrito y evento cantidad
  $('#prods-cart tbody')
    .on('click', 'a[rel="delete"]', function () {
      let tr = listTableCart.cell($(this).closest('td, li')).index()
      Cart.items.prodsList.push(listTableCart.row(tr.row).data())
      Cart.items.prods.splice(tr.row, 1)
      Cart.list()
      if (!Cart.items.prods.length) resetForm()
    })
    .on('change', 'input[name="cantidad"]', function () {
      let tr = listTableCart.cell($(this).closest('td, li')).index()
      Cart.items.prods[tr.row].cant = parseInt($(this).val())
      Cart.calculate_invoice()
      $('td:eq(1)', listTableCart.row(tr.row).node()).html(
        `$${Cart.items.prods[tr.row].subtotal.toFixed(2)}`
      )
    })

  //adicionando al carro por los botones
  d.querySelectorAll('button.prod-id').forEach(e =>
    e.addEventListener('click', function () {
      let parameters = new FormData()
      parameters.append('action', 'getProd')
      parameters.append('id', this.name)

      ajaxFunction(location.pathname, parameters, data => {
        // console.log(data)
        if (!Cart.items.prods.find(e => e.id === data.id)) {
          let product = data
          product.cant = 1
          product.subtotal = 0.0
          Cart.add(product)
          Cart.items.prodsList.splice(Cart.items.prodsList
            .findIndex(e => e.id === product.id), 1)
        }
        Alerta(`${data.name} added to the cart`, 'success')
        // console.log(Cart.items.prods)
      })
    })
  )

  window.addEventListener('load', () => {
    d.querySelector('p.direccion').classList.add('d-none')
    if (d.querySelector('button.home').classList.contains('active'))
      btnHome()
    if (d.querySelector('button.local').classList.contains('active'))
      btnLocal()
  })
  //Eventos btn home y local
  d.querySelector('button.home')
    .addEventListener('click', () => btnHome())
  d.querySelector('button.local')
    .addEventListener('click', () => btnLocal())

  $('#cart').on('hidden.bs.modal', () => {
    if (!Cart.items.prods.length) resetForm()
  })

  //Eventos inputs del cart
  writeInValue('.form-cart-name', '.form-cart-name-1')
  writeInValue('.form-cart-addr', '.form-cart-addr-1')
  writeInValue('.form-cart-note', '.form-cart-note-1')
  errorEmptyValue('.form-cart-name')
  errorEmptyValue('.form-cart-name-1')
  errorEmptyValue('.form-cart-addr-1')
  errorEmptyValue('.form-cart-addr')

  $('#form-cart').on('submit', function (e) {
    e.preventDefault()
    if (!Cart.items.prods.length)
      return Alerta('The shopping cart is empty', 'error')

    //Si no se ha echo focus y se da submit pone clase a los vacios
    validateEmptySubmit('.form-cart-name')
    validateEmptySubmit('.form-cart-name-1')
    validateEmptySubmit('.form-cart-addr-1')
    validateEmptySubmit('.form-cart-addr')

    //Ultimas validaciones por resolution
    if (d.querySelector('button.home').classList.contains('active')) {
      if ($(window).width() < 575)
        lastSubmitValidate2('.form-cart-name-1', '.form-cart-addr-1')
      else
        lastSubmitValidate2('.form-cart-name', '.form-cart-addr')
    } else {
      if ($(window).width() < 575)
        lastSubmitValidate('.form-cart-name-1')
      else
        lastSubmitValidate('.form-cart-name')
    }
  })

  $('#lista').on('shown.bs.modal', () => {
    listProds.responsive.recalc()
    listProds.columns.adjust()
  })

  $('a[rel="ver-lista"]').on('click', function () {
    listProds = $('#listProds').DataTable({
      responsive: true,
      autoWidth: false,
      destroy: true,
      paginate: false,
      info: false,
      searching: true,
      // lengthMenu:[6,20,60,100],
      tabIndex: -10,
      data: Cart.items.prodsList,
      // ajax: {
      //   url: window.location.pathname,
      //   type: 'POST',
      //   data: {
      //     'action': 'list_products',
      //     'ids': JSON.stringify(Cart.get_ids()),
      //   },
      //   dataSrc: ""
      // },
      columns: [
        {"data": "name"},
        {"data": "desc"},
        {"data": "id"},
      ],
      columnDefs: [
        {
          targets: [0],
          class: 'w-35',
          render: (data, type, row) =>
            $(window).width() <= 576
              ? truncate(data, 10, '..') + `<br> <div class="text-xs">$${row.s_price}</div>`
              : $(window).width() <= 768
                ? truncate(data, 16, '..') + `<br> <div class="text-xs">$${row.s_price}</div>`
                : truncate(data, 30, '...') + `<br> <div class="text-xs">$${row.s_price}</div>`
        },
        {
          targets: [-2],
          class: 'list-desc w-55',
          render: data => $(window).width() <= 576
            ? truncate(data, 35, '..')
            : $(window).width() <= 768
              ? truncate(data, 52, '..')
              : truncate(data, 125, '...')
        },
        {
          targets: [-1],
          class: 'text-center w-10 align-middle',
          // orderable: false,
          render: () =>
            '<a rel="add" class="btn bg-gradient-orange text-white btn-sm circular">' +
            '<i class="mdi mdi-cart-plus mdi-15px"></i></a>'
        },
      ],
      initComplete: function (settings, json) {
      },
      drawCallback: function (settings) {
        $('ul.pagination').addClass('pagination-sm')
          .find('li.previous a').addClass('circular-left').parent().parent()
          .find('li.next a').addClass('circular-right')
        // console.log(settings)
      }
    })
    $('#lista').modal('show')
  })

  $('#listProds tbody')
    .on('click', 'a[rel="add"]', function () {
      let tr = listProds.cell($(this).closest('td, li')).index(),
        product = listProds.row(tr.row).data()
      product.cant = 1
      product.subtotal = 0.00
      Cart.add(product)
      Cart.items.prodsList.splice(tr.row, 1)
      console.log(tr.row)
      listProds.row($(this).parents('tr')).remove().draw() //elimina la fila
      Alerta(`${product.name} added to the cart`, 'success')
    })
})
const d = document
let
  removeAcents = str => {
    const acents = {á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ñ: 'n'}
    return str.split('').map(e => acents[e] || e).join('').toString()
  }
  ,
  Alerta = (text, icon = 'success') => {
    const Alerta = Swal.mixin({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000
    })
    Alerta.fire({
      icon: icon,
      title: text
    })
  }
  ,
  btnHome = () => {
    d.querySelector('button.home').classList.add('active')
    d.querySelector('i.home').classList.add('mdi-check')
    d.querySelector('button.local')
      .classList.remove('active')
    d.querySelector('i.local').classList.remove('mdi-check')
    d.querySelectorAll('div.div-direccion').forEach(e =>
      e.classList.remove('d-none')
    )
    d.querySelector('p.horario').classList.remove('d-none')
    d.querySelector('p.direccion').classList.add('d-none')
  }
  ,
  btnLocal = () => {
    d.querySelector('button.home')
      .classList.remove('active')
    d.querySelector('i.home').classList.remove('mdi-check')
    d.querySelector('button.local')
      .classList.add('active')
    d.querySelector('i.local').classList.add('mdi-check')
    d.querySelectorAll('div.div-direccion').forEach(e =>
      e.classList.add('d-none')
    )
    d.querySelector('p.horario').classList.add('d-none')
    d.querySelector('p.direccion').classList.remove('d-none')
  }
  ,
  writeInValue = (selector, selector1) => {
    d.querySelector(`${selector}`)
      .addEventListener('input', function () {
        d.querySelector(`${selector1}`).value = this.value
      })
    d.querySelector(`${selector1}`)
      .addEventListener('input', function () {
        d.querySelector(`${selector}`).value = this.value
      })
  }
  ,
  errorEmptyValue = selector => {
    d.querySelector(`${selector}`).addEventListener('blur', function () {
      if (!Cart.items.prods.length) return
      if (!(this.value)) this.classList.add('is-invalid')
      else this.classList.remove('is-invalid')
    })
    d.querySelector(`${selector}`).addEventListener('focus', function () {
      if (!Cart.items.prods.length) return
      if (!(this.value)) this.classList.remove('is-invalid')
      // else this.classList.add('is-invalid')
    })
  }
  ,
  checkIsValidClass = selector => d.querySelector(`${selector}`).classList.contains('is-invalid')
  ,
  validateEmptySubmit = selector => {
    if (d.querySelector(`${selector}`).value)
      return true
    d.querySelector(`${selector}`).classList.add('is-invalid')
    return false
  }
  ,
  resetForm = () => {
    d.querySelectorAll('[class*="form-cart-name"]').forEach(e => {
      e.classList.remove('is-invalid')
      e.value = ''
    })
    d.querySelectorAll('[class*="form-cart-addr"]').forEach(e => {
      e.classList.remove('is-invalid')
      e.value = ''
    })
    d.querySelectorAll('[class*="form-cart-note"]').forEach(e => {
      e.value = ''
    })
  }
  ,
  lastSubmitValidate2 = (selector, selector1) => {
    if (checkIsValidClass(`${selector}`) ||
      checkIsValidClass(`${selector1}`)) {
      Alerta('Complete the form, please', 'error')
    } else {
      submit()
      window.open(`https://api.whatsapp.com/send/?phone=+5358496023&text=${generateMSG()}&app_absent=1`)

      // window.open(`https://api.whatsapp.com/send/?phone=+5358496023&text=${generateMSG()}&app_absent=1`)
      $('#cart').modal('hide')
      Cart.items.prodsList = Cart.items.prodsList.concat(Cart.items.prods)
      Cart.items.prods = []
      Cart.list()
      resetForm()
    }
  }
  ,
  lastSubmitValidate = selector => {
    if (checkIsValidClass(`${selector}`)) {
      Alerta('Complete the form, please', 'error')
    } else {
      submit()
      window.open(`https://api.whatsapp.com/send/?phone=+5358496023&text=${generateMSG()}&app_absent=1`)
      $('#cart').modal('hide')
      Cart.items.prodsList = Cart.items.prodsList.concat(Cart.items.prods)
      Cart.items.prods = []
      Cart.list()
      resetForm()
    }
  }
  ,
  generateMSG = () => {
    let table = ''
    Cart.items.prods.forEach(e => table += `${e.name} (${e.s_price}) * ${e.cant}%0A`)
    table += `%0ATotal: ${d.querySelector('span.cart-total').innerText}%0A%0A`

    let dataClient = 'Name: ' + d.querySelector('.form-cart-name').value + '%0A'
    if (d.querySelector('.form-cart-note').value)
      dataClient += `Note: ${d.querySelector('.form-cart-note').value}%0A`

    if (d.querySelector('button.home').classList.contains('active')) {
      let str = `${location.href}startpage/cart/invoice/pdf/${Cart.id}/` + '%0A Hola, me gustaría comprar los siguientes productos y que me los traigan a la dirección: %0A'
        + d.querySelector('.form-cart-addr').value + '%0A%0A'
      str += table
      str += dataClient
      return str
    } else {
      let str = `${location.href}startpage/cart/invoice/pdf/${Cart.id}/` + '%0A Hola me gustaría comprar los siguientes productos: %0A%0A'
      str += table
      str += dataClient
      return str
    }
  }
  ,
  getAllProducts = () => {
    let parameters = new FormData(),
      list = []
    parameters.append('action', 'list_products')
    parameters.append('ids', JSON.stringify(Cart.get_ids()))
    ajaxFunction(location.pathname, parameters, (data) => data.forEach(e => list.push(e)))
    return list
  }
  ,
  submit = () => {
    let parameters = new FormData()
    parameters.append('action', 'create')
    let vent = {
      'cli_name': d.querySelector('.form-cart-name').value,
      'cli_addr': d.querySelector('button.home').classList.contains('active')
        ? d.querySelector('.form-cart-addr').value : '',
      'cli_note': d.querySelector('.form-cart-note').value ?
        d.querySelector('.form-cart-note').value : '',
      'total': d.querySelector('span.cart-total').innerText.substr(1),
      'prods': Cart.items.prods
    }
    parameters.append('cart', JSON.stringify(vent))
    ajaxFunction(location.pathname, parameters, response => {
      Cart.id = response.id
    }, false)
  }
  ,
  Cart = {
    items: {
      prods: [],
      total: 0.0,
      prodsList: [],
    },
    id: -1,
    get_ids: () => Cart.items.prods.map(value => value.id),
    calculate_invoice: function () {
      let subtotal = 0.0
      $.each(this.items.prods, (pos, dict) => {
        dict.pos = pos
        dict.subtotal = dict.cant * parseFloat(dict.s_price)
        subtotal += dict.subtotal
      })
      this.items.total = subtotal
      $('span.cart-total').text('$' + this.items.total.toFixed(2))
      //escribir en el total
    },
    add: item => {
      if (Cart.items.prods.find(e => e.id === item.id)) return
      Cart.items.prods.push(item)
      Cart.list()
    },
    list: function () {
      this.calculate_invoice()
      listTableCart = $('#prods-cart').DataTable({
        responsive: false,
        autoWidth: false,
        destroy: true,
        paginate: false,
        info: false,
        data: this.items.prods,
        searching: false,
        language: {emptyTable: 'When you add a product it will appear here'},
        columns: [
          {data: 'name'},
          {data: 's_price'},
          {data: 'cant'},
          {data: 'id'}
        ],
        columnDefs: [
          {
            targets: [-1],
            class: 'text-right w-10 td-cart py-1 align-middle',
            render: () => `
            <a rel="delete" class="btn bg-gradient-danger  text-white btn-xs" style="width: 28px">
            <i class="mdi mdi-trash-can-outline mdi-15px"></i></a>`
          },
          {
            targets: [-2],
            class: 'text-center w-35 td-cart px-0 py-1 align-middle',
            render: (data, type, row) => `
                <input type="text" name="cantidad" 
                class="form-control text-center  form-control-sm input-sm"
                autocomplete="off" value="${row.cant}">`
          },
          {
            targets: [-3],
            class: 'text-right w-15 td-cart py-1 align-middle',
            render: data => `$${parseFloat(data).toFixed(2)}`
          },
          {
            targets: [0],
            class: 'w-40 td-cart py-1',
            render: (data, type, row) =>
              $(window).width() <= 400
                ? truncate(data, 8, '..') + `<br> <div class="text-xs">$${row.s_price}</div>`
                : $(window).width() <= 576
                  ? truncate(data, 10, '..') + `<br> <div class="text-xs">$${row.s_price}</div>`
                  : truncate(data, 17, '...') + `<br> <div class="text-xs">$${row.s_price}</div>`
          }
        ],
        rowCallback(row, data, displayNum, displayIndex, dataIndex) {
          $(row).find('input[name="cantidad"]').TouchSpin({
            min: 1,
            max: data.stock,
            step: 1,
            buttondown_class: 'btn bg-gradient-secondary circular-left',
            buttonup_class: 'btn bg-gradient-secondary circular-right'
          })
        },
        initComplete: (settings, json) => {
        }
      })
    }
  }