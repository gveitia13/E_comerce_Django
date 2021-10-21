$(() => {
  addEvents()
  $('.select2bs4').select2({
    theme: 'bootstrap4'
  })

  $('button[task="task_add"]').on('click', function () {
    let li = $('li[task="task_add"]')
    if (li.hasClass('d-none')) {
      li.removeClass('d-none')
      $(this).removeClass('bg-gradient-indigo').addClass('btn-outline-secondary')
        .html('<i class="mdi mdi-cancel"></i> Cancel')
    } else if (!li.hasClass('d-none')) {
      li.addClass('d-none')
      $(this).addClass('bg-gradient-indigo').removeClass('btn-outline-secondary')
        .html('<i class="mdi mdi-plus"></i> Add task')
      $('input.task-text').val('')
      $('select[name="owner"]').val('').trigger('change.select2')
    }
  })

  $('#form-task-add').on('submit', function (e) {
    e.preventDefault()
    let parameters = new FormData(this)
    parameters.append('action', 'task_add')
    submit_with_ajax(location.pathname, parameters, response => {
      console.log(response)
      write_todo_footer(response['task_made'])
      write_my_task(response['my_tasks'])

      let $ul = d.querySelector('ul.todo-list')
      let texto = staff === 'True' ? `(${response['task'].owner.first_name})` : ''

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

      $('button[task="task_add"]').click()
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
const d = document
let
  write_todo_footer = n => $('span[task]').text(`${n} tasks made of`),
  write_my_task = n => $('h5[task="my_tasks"]').text(n),
  removeEvents = () => {
    $('input[type="checkbox"]').off('change')
    $('i[task]').off('click')
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
      let parameters = new FormData()
      parameters.append('action', 'del_task')
      parameters.append('id', this.attributes[1].value)

      submit_with_ajax(location.pathname, parameters, response => {
        $(`li[task=${response['task'].id}]`).css('display', 'none')
        write_todo_footer(response['task_made'])
        write_my_task(response['my_tasks'])
      })
    })
  }
