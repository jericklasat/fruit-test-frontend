$(document).ready(function (e) {
  new DataTable('#fruits-table', {
    ajax: API_URL + '/fruits/paginated',
    processing: true,
    serverSide: true,
    ordering: false,
    lengthChange: false,
    columns: [
      {
        data: 'name',
        render: function(data,_, row) {
          return `<div>
                    <a data-fruit-id="${row.fruit_id}" class="add-to-favorite waves-effect waves-light green btn-small"><i class="material-icons">favorite</i></a>
                    ${data}
                  </div>`;
        }
      },
      {data: 'family'},
      {data: 'order_name'},
      {data: 'genus'},
      {
        data: 'calories',
        render: function(_, _, row) {
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

              if (title === 'Name' || title === 'Family') {
                let input = document.createElement('input');
                input.placeholder = title;
                column.header().replaceChildren(input);

                input.addEventListener('keyup', () => {
                    if (column.search() !== this.value) {
                        column.search(input.value).draw();
                    }
                });
              }
          });
    },
  });
});

$(document).ready(function (e) {
  var token = window.localStorage.getItem('token');
  var savedEmail = window.localStorage.getItem('email');
  var hasToken = null !== token;
  var headerLogin = $('#header-login');
  var headerLogout = $('#header-logout');
  var headerEmail = $('#header-email');
  var favoritesLink = $('#favorites-link');
  var loginModal = $('#login-modal').modal();
  var loginModalInstance = M.Modal.getInstance(loginModal);
  var loginProgress = $('#loading-progress');
  var loginBtn = $('#login-btn');
  var signupBtn = $('#signup-btn');
  var modalFormMessage = $('#modal-form-message');
  
  if (hasToken) {
    headerLogin.parent().hide();
    headerLogout.parent().show();
    headerEmail.show();
    favoritesLink.parent().show();
    headerEmail.text(savedEmail);
  }

  headerLogin.on('click', function(e){
    e.preventDefault();
    loginModalInstance.open();
  });

  headerLogout.on('click', function() {
    window.localStorage.removeItem('token');
    window.location.reload();
  });

  $('#fruits-table tbody').on('click', 'a.add-to-favorite', function (e) {
    if (! hasToken) {
      loginModalInstance.open();
    
      return;
    }

    var fruit_id = $(this).attr('data-fruit-id');

    $.ajax({
      type: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
      },
      url: API_URL + '/user/favorite/fruit/add?fruitId=' + fruit_id,
    }).done(function (response) {
      e.preventDefault();

      M.toast({html: response.message});
    });
  });

  loginBtn.on('click', function(e) {
    var email = $('#login-modal #email');
    var password = $('#login-modal #password');
    
    if (email.val().length < 1 || password.val().length < 1 ) {
      modalFormMessage.text('Email and Password is required.');

      return;
    }

    loginProgress.removeClass('hidden');
    loginBtn.prop('disabled', true);

    $.ajax({
      type: 'POST',
      url: API_URL + '/user/login',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify({
        emailAddress: email.val(),
        password: password.val()
      }),
    }).done(function (response) {
      e.preventDefault();

      loginProgress.addClass('hidden');
      loginBtn.removeAttr('disabled');

      if (typeof response.token === 'undefined') {
        modalFormMessage.text(response.message);
        return;
      }

      window.localStorage.setItem('token', response.token);
      window.localStorage.setItem('email', email.val());
      window.location.reload();
    });
  });

  signupBtn.on('click', function(e) {
    e.preventDefault();

    var email = $('#login-modal #email');
    var password = $('#login-modal #password');
    
    if (email.val().length < 1 || password.val().length < 1 ) {
      modalFormMessage.text('Email and Password is required.');

      return;
    }

    loginProgress.removeClass('hidden');
    loginBtn.prop('disabled', true);

    $.ajax({
      type: 'POST',
      url: API_URL + '/user/create',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify({
        emailAddress: email.val(),
        password: password.val()
      }),
    }).done(function (isSuccessful) {
      loginProgress.addClass('hidden');
      loginBtn.removeAttr('disabled');

      if (! isSuccessful) {
        modalFormMessage.text('Account already existing.');

        return;
      }
      
      $.ajax({
        type: 'POST',
        url: API_URL + '/user/login',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
          emailAddress: email.val(),
          password: password.val()
        }),
      }).done(function (response) {
        e.preventDefault();
  
        loginProgress.addClass('hidden');
        loginBtn.removeAttr('disabled');
  
        if (typeof response.token === 'undefined') {
          modalFormMessage.text(response.message);
          return;
        }

        window.localStorage.setItem('token', response.token);
        window.localStorage.setItem('email', email.val());
        window.location.reload();
      });
    });
  });
});