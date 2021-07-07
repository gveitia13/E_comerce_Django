$(function () {
  let table = $('#data').DataTable({
    responsive: true,
    autoWidth: false,
    destroy: true,
    deferRender: true,
    ajax: {
      url: window.location.pathname,
      type: 'POST',
      data: {'action': 'searchdata'},
      dataSrc: ""
    },
    columns: [
      {"data": "name"},
      {"data": "desc"},
      {"data": "desc"},
    ],
    columnDefs: [
      {
        targets: [-1],
        class: 'text-center',
        orderable: false,
        render: (data, type, row) => {
          let buttons = `<a href="/main/category/update/${row.id}/" class="btn bg-gradient-warning btn-xs"><i class="mdi mdi-square-edit-outline mdi-15px"></i></a> `
          buttons += `<a id='dt-del' href="/main/category/delete/${row.id}/" type="button" class="btn bg-gradient-danger btn-xs"><i class="mdi mdi-trash-can-outline mdi-15px"></i></a>`
          return buttons
        }
      },
    ],
    dom: 'Bfrtip',
    initComplete: (settings, json) => {

    },
  });
});