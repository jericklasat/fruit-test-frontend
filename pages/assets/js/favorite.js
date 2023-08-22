$(document).ready(function (e) {
  var token = window.localStorage.getItem("token");
  var savedEmail = window.localStorage.getItem("email");
  var hasToken = null !== token;
  var headerLogout = $("#header-logout");
  var headerEmail = $("#header-email");

  if (hasToken) {
    headerLogout.parent().show();
    headerEmail.show();
    headerEmail.text(savedEmail);
  } else {
    window.location.replace("/");
  }

  headerLogout.on("click", function () {
    window.localStorage.removeItem("token");
    window.location.replace("/");
  });
});

$(document).ready(function (e) {
  var token = window.localStorage.getItem("token");
  var $totalCalories = $('#total-calories');
  var $totalFat = $('#total-fat');
  var $totalSugar = $('#total-sugar');
  var $totalCarbohydrates = $('#total-carbohydrates');
  var $totalProtein = $('#total-protein');

  $dataTable = new DataTable("#favorite-fruits-table", {
    ajax: {
      url: API_URL + "/fruits/favorite/paginated",
      method: "GET",
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + token);
      }
    },
    processing: true,
    serverSide: true,
    ordering: false,
    lengthChange: false,
    columns: [
      {
        data: "name",
        render: function (data, _, row) {
          return `<div>
                    <a data-fruit-id="${row.fruit_id}" class="remove-to-favorite waves-effect waves-light red btn-small"><i class="material-icons">close</i></a>
                    ${data}
                  </div>`;
        }
      },
      { data: "family" },
      { data: "order_name" },
      { data: "genus" },
      {
        data: "calories",
        render: function (_, _, row) {
          return `<ul class="collapsible">
                    <li>
                      <div class="collapsible-header"><i class="material-icons green">monitor_heart</i>Nutritions</div>
                      <div class="collapsible-body">
                        <ul class="collection">
                          <li class="collection-item">Calories - ${row["calories"]}</li>
                          <li class="collection-item">Fat - ${row["fat"]}</li>
                          <li class="collection-item">Sugar - ${row["sugar"]}</li>
                          <li class="collection-item">Carbohydrates - ${row["carbohydrates"]}</li>
                          <li class="collection-item">Protein - ${row["protein"]}</li>
                        </ul>
                      </div>
                    </li>
                  </ul>`;
        }
      }
    ],
    initComplete: function () {
      $('.collapsible').collapsible();
      
      this.api()
        .columns()
        .every(function () {
          let column = this;
          let title = column.header().textContent;

          if (title === "Name" || title === "Family") {
            let input = document.createElement("input");
            input.placeholder = title;
            column.header().replaceChildren(input);

            input.addEventListener("keyup", () => {
              if (column.search() !== this.value) {
                column.search(input.value).draw();
              }
            });
          }
        });
    },
    drawCallback: function() {
      var rows = this.api().rows().data();
      var totalNutritions = {
        calories: 0,
        fat: 0,
        sugar: 0,
        carbohydrates: 0,
        protein: 0,
      };

      rows.map(row => {
        totalNutritions.calories += parseFloat(row['calories']);
        totalNutritions.fat += parseFloat(row['fat']);
        totalNutritions.sugar += parseFloat(row['sugar']);
        totalNutritions.carbohydrates += parseFloat(row['carbohydrates']);
        totalNutritions.protein += parseFloat(row['protein']);
      });

      $totalCalories.text(totalNutritions.calories);
      $totalFat.text(totalNutritions.fat);
      $totalSugar.text(totalNutritions.sugar);
      $totalCarbohydrates.text(totalNutritions.carbohydrates);
      $totalProtein.text(totalNutritions.protein);
    }
  });

  $("#favorite-fruits-table tbody").on(
    "click",
    "a.remove-to-favorite",
    function (e) {
      var fruit_id = $(this).attr("data-fruit-id");

      $.ajax({
        type: "GET",
        headers: {
          Authorization: "Bearer " + token
        },
        url:
        API_URL + '/user/favorite/fruit/remove?fruitId=' +
          fruit_id
      }).done(function (response) {
        e.preventDefault();

        M.toast({ html: response.message });

        $dataTable.clear().draw();
      });
    }
  );
});
