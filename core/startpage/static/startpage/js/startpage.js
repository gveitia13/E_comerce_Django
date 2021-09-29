$(function () {
  const d = document
  document.querySelectorAll('a').forEach(e =>
    e.classList.remove('active'))
  document.querySelector('.startpage').className += ' active'

  //Buscando en tiempo real
  d.querySelector('.formHeader input').addEventListener('input', function () {
    setTimeout(() => {
      let productos = Array.from(d.querySelectorAll('span.prodName')).map(e => e.innerText)

      d.querySelectorAll('div.div-card span').forEach(f => {
        let str = removeAcents(f.innerText.toLowerCase())
        if (!str.includes(this.value.toLowerCase())) {
          f.parentElement.classList.remove('d-md-inline-block', 'd-sm-inline-block')
          f.parentElement.classList.add('d-none')
        } else {
          f.parentElement.classList.add('d-md-inline-block', 'd-sm-inline-block')
          f.parentElement.classList.remove('d-none')
        }
      })
    }, 250)
  })

  d.querySelectorAll('.div-img').forEach(e => e.addEventListener('click', function () {
    let parameters = new FormData()
    parameters.append('action', 'getProd')
    parameters.append('id', this.id)

    ajaxFunction(location.pathname, parameters, (data) => {
      $('#prodDetails h5.name').html(`<b>${data['full_name']}</b>`)
      $('#prodDetails span.stock').html(`<b> Stock:</b> ${data['stock']}`)
      $('#prodDetails p.desc').text(`${data['desc']}`)
      $('#prodDetails span.price').html(`<b>${data['s_price']}</b> CUP`)
      // $('#prodDetails div.imgProdDetails').css(`background: url('${data['image']}')`)
      d.querySelector('#prodDetails div.imgProdDetails').style = `background: url('${data['image']}');background-color:#333;`
    })
    $('#prodDetails').modal('show')
  }))

  d.querySelector('a[rel="contact"]').addEventListener('click', () =>
    $('#contact').modal('show'))

})
let
  removeAcents = str => {
    const acents = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n'}
    return str.split('').map(e => acents[e] || e).join('').toString()
  }
//   get_ajaxFunction = function (url, parameters, callback) {
//   $.ajax({
//     url: url,
//     type: 'GET',
//     data: parameters,
//     dataType: 'json',
//     processData: false,
//     contentType: false,
//   }).done(function (data) {
//     console.log(data);
//     if (!data.hasOwnProperty('error')) {
//       callback(data)
//       return false
//     }
//     if (data['error'].toString().includes('UNIQUE'))
//       message_error(`There is already a ${ent} with this name`)
//     else
//       message_error(data.error);
//   }).fail(function (jqXHR, textStatus, errorThrown) {
//     alert(textStatus + ': ' + errorThrown)
//   }).always(function (data) {
//
//   })
// }
