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
    $('#prodDetails').modal('show')
  }))
})
let
  removeAcents = str => {
    const acents = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n'}
    return str.split('').map(e => acents[e] || e).join('').toString()
  }