var crypt_key = "Yes, I used a cleartext key.";
var crypt_status = {};
var glob_crypt_status = false;
var in_process = false;

$(document).ready(function() {
  $('.crypt-text').each(function() {
    toggleCryptElement(this.id);
  });
  glob_crypt_status = true;
  $('#toggle').text('Decrypt');
  setTimeout(function() {
    $('#twitter').hide();
  }, 500);

  $('#toggle').click(function() {
    $('.crypt-text').each(function() {
      toggleCryptElement(this.id);
    });
    glob_crypt_status = !glob_crypt_status;
    if (glob_crypt_status) {
      $('#toggle').text('Decrypt');
      $('#twitter').hide();
    } else {
      $('#toggle').text('Encrypt');
      $('#twitter').show();
    }
  });

});

function toggleCryptElement(el_id) {
  if (in_process) {
    return;
  }
  if (!crypt_status.hasOwnProperty(el_id) || crypt_status[el_id] == false) {
    in_process = true;
    var text = CryptoJS.AES.encrypt($("#" + el_id).text(), crypt_key).toString();
    $("#" + el_id).text(CryptoJS.AES.encrypt($("#" + el_id).text(), crypt_key).toString());
    crypt_status[el_id] = true;
    in_process = false;
  } else if (crypt_status[el_id] == true) {
    in_process = true;
    var text = CryptoJS.AES.decrypt($("#" + el_id).text(), crypt_key).toString();
    $("#" + el_id).text(CryptoJS.AES.decrypt($("#" + el_id).text(), crypt_key).toString(CryptoJS.enc.Utf8));
    crypt_status[el_id] = false;
    in_process = false;
  }
}
