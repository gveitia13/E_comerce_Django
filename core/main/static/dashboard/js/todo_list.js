$(() => {
  addEvents()
  $('.select2bs4').select2({
    theme: 'bootstrap4'
  })

  $('button[task="task_add"]').on('click', function () {
    let li = $('li[task="task_add"]')
    idToEdit.id = -1
    if (li.hasClass('d-none')) {
      li.removeClass('d-none')
      $(this).removeClass('bg-gradient-indigo').addClass('btn-outline-secondary')
        .html('<i class="mdi mdi-cancel"></i> Cancel')
    } else if (!li.hasClass('d-none')) {
      clearForm()
      $(`li[task!="task_add"]`).removeClass('d-none')
    }
  })

  $('#form-task-add').on('submit', function (e) {
    e.preventDefault()
    let parameters = new FormData(this)
    parameters.append('action', 'task_add')
    parameters.append('id', idToEdit.id)

    submit_with_ajax(location.pathname, parameters, response => {
      write_todo_footer(response['task_made'])
      write_my_task(response['my_tasks'])
      idToEdit.id = -1
      let texto = staff === 'True' ? `(${response['task'].owner.first_name})` : ''

      if (response['edit'] === '0') {
        let $ul = d.querySelector('ul.todo-list')
        $ul.children[$ul.children.length - 1].insertAdjacentHTML('beforebegin', `
      <li class="circular" task="${response['task'].id}">
          <span class="handle ui-sortable-handle">
            <i class="mdi mdi-swap-vertical"></i>
          </span>
          <div class="icheck-primary d-inline ml-2">
              <input type="checkbox" value=""
                     name="todo${response['task'].id}" id="todoChecks${response['task'].id}">
              <label for="todoChecks${response['task'].id}"></label>
          </div>
          <span class="text">${response['task'].text} ${texto} 
              </span>
          <small id="time${response['task'].id}" class="badge badge-${response['task']['get_Time'].clase}"><i class="mdi mdi-clock-outline">
            </i> <span>${response['task']['get_Time'].num} ${response['task']['get_Time'].text}</span></small>
          <div class="tools">
              ${staff === 'True' ? `<i class="mdi mdi-square-edit-outline"></i>` : ''}
              <i class="mdi mdi-trash-can-outline" task="${response['task'].id}"></i>
          </div>
      </li>`)
        clearForm()
      } else {
        $(`li[task=${response['task'].id}] span.text`).text(`${response['task'].text} ${texto} `)
        $(`li[task!="task_add"]`).removeClass('d-none')
        clearForm()
      }
      removeEvents()
      addEvents()
    })
  })

  setInterval(() => {
    let parameters = new FormData()
    parameters.append('action', 'get_All_Task')
    ajaxFunction(location.pathname, parameters, (response) =>
      response.forEach(e => {
        d.querySelectorAll('small[id^=time]').forEach(f => {
          if (f.id.slice(4) == e.id) {
            f.children[1].innerHTML = `${e.num} ${e.text}`
            f.classList[1] = `badge-${e.clase}`
          }
        })
      }))
  }, 300000)

})
// idToEdit = {id: -1}
const d = document
let
  accion = '',
  write_todo_footer = n => $('span[task]').text(`${n} tasks made of`),
  write_my_task = n => $('h5[task="my_tasks"]').text(n),
  removeEvents = () => {
    $('input[type="checkbox"]').off('change')
    $('i[task]').off('click')
    $('i[rel^="edit"]').off('click')
  },
  addEvents = () => {
    $('input[type="checkbox"]').on('change', function () {
      console.log(this.checked)
      let parameters = new FormData()
      parameters.append('action', 'state')
      parameters.append('status', this.checked)
      parameters.append('id', this.name.slice(4))

      submit_with_ajax(location.pathname, parameters, response => {
        write_todo_footer(response['task_made'])
        write_my_task(response['my_tasks'])
      })
    })
    $('i[task]').on('click', function () {
      // accion = 'delete'
      let parameters = new FormData()
      parameters.append('action', 'del_task')
      parameters.append('id', this.attributes[1].value)

      submit_with_ajax(location.pathname, parameters, response => {
        // $(`li[task=${response['task'].id}]`).css('display', 'none')
        $(`li[task=${response['task'].id}]`).addClass('d-none')
        write_todo_footer(response['task_made'])
        write_my_task(response['my_tasks'])
      })
    })

    $('i[rel^="edit"]').on('click', function () {
      $(`li[task!="task_add"]`).removeClass('d-none')
      let li = $(this).parents('li')
      li.addClass('d-none')
      $('li[task="task_add"]').insertAfter(li).removeClass('d-none')
      idToEdit.id = this.attributes[1].value.slice(4)

      $('button[task="task_add"]').removeClass('bg-gradient-indigo').addClass('btn-outline-secondary')
        .html('<i class="mdi mdi-cancel"></i> Cancel')
      //obtengo el task y lleno el form
      let params = new FormData()
      params.append('action', 'get_task_by_id')
      params.append('id', this.attributes[1].value.slice(4))
      ajaxFunction(location.pathname, params, (data) => {
        d.querySelector('.task-text').value = data['text']
        let newOption = new Option(data['owner']['username'], data['owner']['id'], false, true)
        $('select[name="owner"]').append(newOption).trigger('change')
      })
    })
  },
  clearForm = () => {
    $('li[task="task_add"]').appendTo('ul.todo-list').addClass('d-none')
    $('button[task="task_add"]').addClass('bg-gradient-indigo')
      .removeClass('btn-outline-secondary')
      .html('<i class="mdi mdi-plus"></i> Add task')
    $('input.task-text').val('')
    $('select[name="owner"]').val('').trigger('change.select2')
  }
