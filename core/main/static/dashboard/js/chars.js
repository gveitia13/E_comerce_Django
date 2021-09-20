let
  get_graph_sales_years_month = function () {
    $.ajax({
      url: window.location.pathname,
      type: 'POST',
      data: {
        'action': 'get_graph_sales_years_month'
      },
      dataType: 'json',
    }).done(function (data) {
      if (!data.hasOwnProperty('error')) {
        console.log(data)
        graphcolumn.addSeries(data)
        return false
      }
      message_error(data.error)
    }).fail(function (jqXHR, textStatus, errorThrown) {
      alert(textStatus + ': ' + errorThrown)
    }).always(function (data) {

    });
  },

  get_graph_sales_products_year_month = function () {
    $.ajax({
      url: window.location.pathname,
      type: 'POST',
      data: {
        'action': 'get_graph_sales_products_year_month'
      },
      dataType: 'json',
    }).done(function (data) {
      if (!data.hasOwnProperty('error')) {
        console.log(data)
        graphpie.addSeries(data)
        return false
      }
      message_error(data.error)
    }).fail(function (jqXHR, textStatus, errorThrown) {
      alert(textStatus + ': ' + errorThrown)
    }).always(function (data) {

    });
  }

$(function () {
  if (window.location.pathname === '/')
    document.querySelector('.my-dash').classList.add('active')
  get_graph_sales_years_month()
  get_graph_sales_products_year_month()
})