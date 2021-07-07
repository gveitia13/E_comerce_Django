$(function () {
  //Set active class to Category path
  if (window.location.pathname.includes('category')) {
    changeSidebar('.my-stored', '.my-stored-cat')
  }
  //Set active class to Product path
  if (window.location.pathname.includes('product')) {
    changeSidebar('.my-stored', '.my-stored-prod')
  }

  btnEvents()

  //Event submit Modal Form
  $('#myModalForm').on('submit', function (e) {
    e.preventDefault();
    const parameters = new FormData(this);
    if (document.querySelector('#myModalFormTitle').name === 'action-add')
      parameters.append('action', 'add')
    if (document.querySelector('#myModalFormTitle').name === 'action-edit') {
      parameters.append('action', 'edit')
      parameters.append('id', `${idToEdit.id}`)
    }
    submit_with_ajax(window.location.pathname, parameters, function (data) {
      $('#myModal').modal('hide');
      if (document.querySelector('#myModalFormTitle').name === 'action-add')
        callbackCreate(data)
      if (document.querySelector('#myModalFormTitle').name === 'action-edit')
        callbackUpdate(data)
    })
  })
})

let
  btnEvents = function () {
    //Event btn Delete Category
    $('.btnTrash').on('click', function () {
      let parameters = new FormData()
      parameters.append('action', 'dele')
      parameters.append('id', this.name)
      idToDelete.id = this.name
      console.log(document.querySelector(`button[name="${idToDelete.id}"]`).name)

      let cat_name = this.parentNode.parentNode.children[0].innerText
      submit_with_ajax_alert(window.location.pathname, 'Delete',
        `Are you sure you want to delete the ${ent}:<b> ${cat_name}</b> record?`,
        parameters,
        (data) => {
          document.querySelector(`button[name="${idToDelete.id}"]`).parentElement.parentElement.remove()
          Toast(`${ent} ${data['success']} successfully`)
        },
        'mdi mdi-alert-octagram text-danger'
      )
    })

    //Event btn Update Category
    $('.btnUpdate').on('click', function () {
      $('#myModal').modal('show');
      $('#myModalForm').trigger('reset');
      document.forms[0].elements[1].focus()

      document.querySelector('#id_name').value = document.querySelector(`#cat_${this.name}`).innerText
      document.querySelector('#id_desc').value = document.querySelector(`#desc_${this.name}`).innerText

      document.querySelector('#myModalFormTitle').innerHTML =
        `<b><i class="mdi mdi-square-edit-outline"></i> Edit ${ent}</b>`
      document.querySelector('#myModalFormTitle').name = 'action-edit'
      idToEdit.id = this.name
    })
  },

  callbackCreate = function (data) {
    document.getElementById('tbody').innerHTML +=
      createTr(data['object']['id'], data['object']['name'], data['object']['desc'])
    document.getElementById('nameSort').click()

    Toast(`${ent}: ${data['object']['name']} ${data['success']} successfully`)
    btnEvents()
  },

  callbackUpdate = function (data) {
    document.querySelector(`#cat_${idToEdit.id}`).innerText = data['object']['name']
    document.querySelector(`#desc_${idToEdit.id}`).innerText = data['object']['desc']
    Toast(`${ent}: ${data['object']['name']} ${data['success']} successfully`)
  },

  createTr = (id, name, desc) => {
    return `<tr class="item">
            <td id="cat_${id}" style="width: 20%;">${name}</td>
            <td id="desc_${id}" style="width: 65%;">${desc}</td>
            <td class="w3-center" style="width: 15%;">
                <button name="${id}" class="btn bg-gradient-warning btn-xs btnUpdate">
                <i class="mdi mdi-square-edit-outline mdi-15px"></i></button>
                <button name="${id}" class="btn bg-gradient-danger btn-xs btnTrash">
                <i class="mdi mdi-trash-can-outline mdi-15px"></i></button>
            </td>
        </tr>`
  }

