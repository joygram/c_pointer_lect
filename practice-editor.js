/**
 * 실습 코드 에디터: CodeMirror 초기화, C 포맷, 복사
 * 모든 데이터(기본 코드)는 각 HTML 페이지의 textarea에 임베드됨
 */
(function () {
  'use strict';

  var INDENT = '    ';  // 4 spaces

  function formatC(code) {
    var lines = code.split('\n').map(function (l) { return l.trim(); });
    var result = [];
    var level = 0;
    var i, line, trimmed, pre;

    for (i = 0; i < lines.length; i++) {
      line = lines[i];
      trimmed = line.trim();
      if (trimmed === '') {
        result.push('');
        continue;
      }
      if (trimmed.charAt(0) === '}') level = Math.max(0, level - 1);
      pre = '';
      for (var k = 0; k < level; k++) pre += INDENT;
      result.push(pre + trimmed);
      for (var j = 0; j < trimmed.length; j++) {
        if (trimmed.charAt(j) === '{') level++;
        if (trimmed.charAt(j) === '}') level = Math.max(0, level - 1);
      }
    }
    return result.join('\n').trim() + '\n';
  }

  function initPracticeEditor(editorId, toolbarId) {
    var textarea = document.getElementById(editorId);
    if (!textarea) return null;

    var defaultCode = textarea.value;
    var initialCode = defaultCode.trim();
    try {
      initialCode = formatC(initialCode);
    } catch (e) { /* 포맷 실패 시 원본 유지 */ }
    var container = textarea.parentNode;
    textarea.style.display = 'none';

    var editor = CodeMirror(container, {
      value: initialCode,
      mode: 'text/x-csrc',
      theme: 'tomorrow-night-eighties',
      lineNumbers: true,
      indentUnit: 4,
      indentWithTabs: false,
      lineWrapping: true,
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
        'Tab': function (cm) {
          cm.replaceSelection(INDENT, 'end');
        }
      }
    });

    var formatBtn = document.getElementById(toolbarId + '-format');
    var copyBtn = document.getElementById(toolbarId + '-copy');
    var runBtn = document.getElementById(toolbarId + '-run');
    var resultBox = document.getElementById(toolbarId + '-result');
    if (formatBtn) {
      formatBtn.addEventListener('click', function () {
        var code = editor.getValue();
        try {
          editor.setValue(formatC(code));
        } catch (e) {
          editor.setValue(code);
        }
      });
    }
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(editor.getValue()).then(function () {
          var t = copyBtn.textContent;
          copyBtn.textContent = '복사됨!';
          setTimeout(function () { copyBtn.textContent = t; }, 1500);
        });
      });
    }
    if (runBtn && resultBox) {
      runBtn.addEventListener('click', function () {
        var code = editor.getValue();
        if (!code.trim()) {
          resultBox.textContent = '(코드를 입력한 뒤 실행하세요)';
          resultBox.className = toolbarId + '-result';
          return;
        }
        runBtn.disabled = true;
        resultBox.textContent = '실행 중…';
        resultBox.className = toolbarId + '-result running';
        var runUrl = 'https://ce.judge0.com/submissions?base64_encoded=true&wait=true';
        var base64Code;
        try {
          base64Code = btoa(unescape(encodeURIComponent(code)));
        } catch (e) {
          base64Code = btoa(code);
        }
        fetch(runUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            source_code: base64Code,
            language_id: 50,
            stdin: ''
          })
        })
          .then(function (res) {
            return res.json().then(function (data) {
              if (res.status === 401) {
                runBtn.disabled = false;
                resultBox.textContent = '실행 서비스 인증 필요(401). [복사]한 뒤 온라인 C 컴파일러에서 실행해 보세요.';
                resultBox.className = toolbarId + '-result error';
                return Promise.reject(new Error('401'));
              }
              if (res.status === 400) {
                runBtn.disabled = false;
                var msg = (data && (data.error || data.message)) ? String(data.error || data.message) : '요청 형식 오류(400)';
                resultBox.textContent = msg + '\n→ [복사]한 뒤 온라인 C 컴파일러에서 실행해 보세요.';
                resultBox.className = toolbarId + '-result error';
                return Promise.reject(new Error('400'));
              }
              if (!res.ok) throw new Error('API ' + res.status);
              return data;
            });
          })
          .then(function (data) {
            if (!data) return;
            runBtn.disabled = false;
            function decodeBase64(s) {
              if (!s) return '';
              try {
                return decodeURIComponent(escape(atob(s)));
              } catch (e) {
                try { return atob(s); } catch (e2) { return s; }
              }
            }
            var out = '';
            if (data.compile_output) out += '[컴파일]\n' + decodeBase64(data.compile_output) + '\n';
            if (data.stdout) out += decodeBase64(data.stdout);
            if (data.stderr) out += decodeBase64(data.stderr);
            if (data.message) out += decodeBase64(data.message);
            var ok = data.status && data.status.id === 3;
            if (!out.trim()) out = ok ? '(실행됨, 출력 없음)' : (data.status ? data.status.description : '') || '실행 실패';
            if (!out.trim()) out += '\n→ [복사]한 뒤 온라인 C 컴파일러에서 실행해 보세요.';
            resultBox.textContent = out.trim();
            resultBox.className = toolbarId + '-result ' + (ok ? 'ok' : 'error');
          })
          .catch(function (err) {
            runBtn.disabled = false;
            if (err && (err.message === '401' || err.message === '400')) return;
            resultBox.textContent = '실행 실패 (네트워크 또는 CORS). [복사]한 뒤 온라인 C 컴파일러에서 실행해 보세요.';
            resultBox.className = toolbarId + '-result error';
          });
      });
    }

    /* 포커스를 잃을 때 자동 포맷 (오토 포맷) */
    editor.on('blur', function () {
      var code = editor.getValue();
      if (!code.trim()) return;
      try {
        var formatted = formatC(code);
        if (formatted !== code) editor.setValue(formatted);
      } catch (e) { /* 포맷 실패 시 원본 유지 */ }
    });

    /* 참고 정답 코드 "에디터로 복사" 버튼: 같은 details 안의 pre.answer-code-block 내용을 에디터에 넣음 */
    document.querySelectorAll('.copy-answer-to-editor').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var details = btn.closest('details');
        var pre = details ? details.querySelector('pre.answer-code-block') : null;
        if (pre && editor) {
          editor.setValue(pre.textContent.trim());
          if (resultBox) {
            resultBox.textContent = '참고 정답 코드를 에디터에 넣었어요. [실행]으로 확인해 보세요.';
            resultBox.className = toolbarId + '-result ok';
          }
        }
      });
    });

    return editor;
  }

  window.PracticeEditor = {
    formatC: formatC,
    init: initPracticeEditor
  };
})();
