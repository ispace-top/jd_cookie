var jdCode = '';
var loginUrl = '';
var resDiv;

$(document).ready(function() {
    resDiv = document.getElementById('res');
    get_code();
});


$("jdcode").click(function() {
    if (jdCode) {
        copyText(jdCode);
        alert('复制成功，正在跳转App');
        window.open('openapp.jdmobile://');
    } else {
        alert('还没加载好，请稍后重试');
    }
});

$('jumpapp').click(function() {
    if (loginUrl) {
        window.location.href = `openapp.jdmobile://virtual/ad?params=${encodeURI(
      JSON.stringify({
        category: 'jump',
        des: 'ThirdPartyLogin',
        action: 'to',
        onekeylogin: 'return',
        url: loginUrl,
        authlogin_returnurl: 'weixin://',
        browserlogin_fromurl: window.location.host,
      })
    )}`;
    } else {
        alert('还没加载好，请稍后重试');
    }
});

$('qrcode').click(function() {
    if (loginUrl) {
        document.getElementById('qr').style.display = 'flex';
    } else {
        alert('还没加载好，请稍后重试');
    }
});

$('qr').click(function(event) {
    if (event.target.id === 'qr') {
        document.getElementById('qr').style.display = 'none';
    }
});

function get_code() {
    let timeStamp = new Date().getTime();
    ajax({
        url: './qrcode?t=' + timeStamp,
        method: 'get',
        success: function(data) {
            if (data.err == 0) {
                checkLogin(data.user);
                console.log('jdCode:' + data.jdCode);
                jdCode = data.jdCode;
                loginUrl = data.qrcode;
                qrbox = document.getElementById('qrbox');
                qrcode = new QRCode(qrbox, {
                    text: loginUrl,
                    correctLevel: QRCode.CorrectLevel.L,
                });
            }
        },
    });
}

function checkLogin(user) {
    time = setInterval(() => {
        let timeStamp = new Date().getTime();
        ajax({
            url: './cookie?t=' + timeStamp,
            method: 'post',
            data: {
                user,
                msg: document.getElementById('example').value || '无备注'
            },
            success: function(data) {
                if (data.err == 0) {
                    console.log('cookie:' + data.cookie);
                    document.getElementById('qr').style.display = 'none';
                    document.getElementById('res').style.display = 'flex';
                    document.getElementById('cookie').innerHTML =
                        '<span>' +
                        document.getElementById('example').value +
                        '</span>' +
                        '<p>' +
                        data.cookie +
                        '</p><button id="copyToClip">复制</button>';
                    document.getElementById('copyToClip').onclick = function() {
                        copyText(data.cookie);
                        alert('复制成功');
                    };
                    clearInterval(time);
                    jdCode = '';
                    loginUrl = '';
                } else if (data.err == 21) {
                    document.getElementById('tip').style.display = 'flex';
                    alert('请求超时');
                    clearInterval(time);
                    jdCode = '';
                    loginUrl = '';
                }
            },
        });
    }, 3000);
}

function copyText(text) {
    // 数字没有 .length 不能执行selectText 需要转化成字符串
    var textString = text.toString();
    var input = document.querySelector('#copy-input');
    if (!input) {
        input = document.createElement('input');
        input.id = 'copy-input';
        input.readOnly = 'readOnly'; // 防止ios聚焦触发键盘事件
        input.style.position = 'absolute';
        input.style.left = '-1000px';
        input.style.zIndex = '-1000';
        document.body.appendChild(input);
    }
    input.value = textString;
    // ios必须先选中文字且不支持 input.select();
    selectText(input, 0, textString.length);
    console.log(document.execCommand('copy'), 'execCommand');
    if (document.execCommand('copy')) {
        document.execCommand('copy');
        //alert('已复制到粘贴板');
    }
    input.blur();
    // input自带的select()方法在苹果端无法进行选择，所以需要自己去写一个类似的方法
    // 选择文本。createTextRange(setSelectionRange)是input方法
    function selectText(textbox, startIndex, stopIndex) {
        if (textbox.createTextRange) {
            //ie
            const range = textbox.createTextRange();
            range.collapse(true);
            range.moveStart('character', startIndex); //起始光标
            range.moveEnd('character', stopIndex - startIndex); //结束光标
            range.select(); //不兼容苹果
        } else {
            //firefox/chrome
            textbox.setSelectionRange(startIndex, stopIndex);
            textbox.focus();
        }
    }
}

function ajax(options) {
    var url = options.url;
    var method = options.method;
    var data = options.data;
    var success = options.success;
    var ajax = new XMLHttpRequest();
    ajax.open(method, url);
    if (method == 'post') {
        ajax.setRequestHeader('Content-type', 'application/json');
    }
    ajax.send(JSON.stringify(data));
    ajax.onreadystatechange = function() {
        if (ajax.readyState == 4 && ajax.status == 200) {
            success(JSON.parse(ajax.responseText));
        }
    };
}
s