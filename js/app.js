var crypt_key = "Yes, I used a cleartext key.";
var crypt_status = {};
var glob_crypt_status = false;
var in_process = false;
var last_used_scheme = 'aes';

$(document).ready(function() {
  $('.crypt-text').each(function() {
    toggleCryptElement(this.id);
  });
  $('.encrypt').each(function() {
    $('#' + this.id + '_explainer').hide();
  });
  glob_crypt_status = true;
  $('.encrypt-options').hide();
  setTimeout(function() {
    $('#twitter').hide();
  }, 500);

  /*$('#toggle').click(function() {
    $('.crypt-text').each(function() {
      toggleCryptElement(this.id);
    });
    glob_crypt_status = !glob_crypt_status;
    if (glob_crypt_status) {
      $('#toggle').text('Decrypt article');
      $('#twitter').hide();
    } else {
      $('#toggle').text('Encrypt article');
      $('#twitter').show();
    }
  });*/

  $('.encrypt').click(function() {
    last_used_scheme = this.id;
    $('.crypt-text').each(function() {
      toggleCryptElement(this.id);
    });
    glob_crypt_status = true;
    $('#decrypt').show();
    $('.encrypt-options').hide();
    setTimeout(function() {
      $('#twitter').hide();
    }, 500);
  });

  $('#decrypt').click(function() {
    $('.crypt-text').each(function() {
      toggleCryptElement(this.id);
    });
    $('#twitter').show();
    $('.encrypt-options').show();
    $('#decrypt').hide();
  });

  $('.encrypt').mouseover(function() {
    $('#' + this.id + '_explainer').show();
  });

  $('.encrypt').mouseout(function() {
    $('#' + this.id + '_explainer').hide();
  });


});

function toggleCryptElement(el_id) {
  if (in_process) {
    return;
  }
  var text = '';
  if (!crypt_status.hasOwnProperty(el_id)) {
    in_process = true;
    $("#" + el_id).text(encryptText($("#" + el_id).text()));
    crypt_status[el_id] = true;
    in_process = false;
  } else if (crypt_status[el_id] == false) {
    in_process = true;
    $("#" + el_id).fadeOut(function() {
      $("#" + el_id).text(encryptText($("#" + el_id).text()));
      $("#" + el_id).fadeIn();
    });
    crypt_status[el_id] = true;
    in_process = false;
  } else if (crypt_status[el_id] == true) {
    in_process = true;
    $("#" + el_id).fadeOut(function() {
      $("#" + el_id).text(decryptText($("#" + el_id).text()));
      $("#" + el_id).fadeIn();
    });
    crypt_status[el_id] = false;
    in_process = false;
  }
}

function encryptText(cleartext) {
  if (last_used_scheme == 'aes') {
    return CryptoJS.AES.encrypt(cleartext, crypt_key).toString();
  } else if (last_used_scheme = 'des') {
    return CryptoJS.DES.encrypt(cleartext, crypt_key).toString();
  } else if (last_used_scheme = '3des') {
    return CryptoJS.TripleDES.encrypt(cleartext, crypt_key).toString();
  } else if (last_used_scheme = 'rabbit') {
    return CryptoJS.Rabbit.encrypt(cleartext, crypt_key).toString();
  } else if (last_used_scheme = 'rc4') {
    return CryptoJS.RC4.encrypt(cleartext, crypt_key).toString();
  } else if (last_used_scheme = 'rc4drop') {
    return CryptoJS.RC4Drop.encrypt(cleartext, crypt_key).toString();
  } else {
    return ''
  }
}

function decryptText(ciphertext) {
  if (last_used_scheme == 'aes') {
    return CryptoJS.AES.decrypt(ciphertext, crypt_key).toString(CryptoJS.enc.Utf8);
  } else if (last_used_scheme = 'des') {
    return CryptoJS.DES.decrypt(ciphertext, crypt_key).toString(CryptoJS.enc.Utf8);
  } else if (last_used_scheme = '3des') {
    return CryptoJS.TripleDES.decrypt(ciphertext, crypt_key).toString(CryptoJS.enc.Utf8);
  } else if (last_used_scheme = 'rabbit') {
    return CryptoJS.Rabbit.decrypt(ciphertext, crypt_key).toString(CryptoJS.enc.Utf8);
  } else if (last_used_scheme = 'rc4') {
    return CryptoJS.RC4.decrypt(ciphertext, crypt_key).toString(CryptoJS.enc.Utf8);
  } else if (last_used_scheme = 'rc4drop') {
    return CryptoJS.RC4Drop.decrypt(ciphertext, crypt_key).toString(CryptoJS.enc.Utf8);
  } else {
    return ''
  }
}
