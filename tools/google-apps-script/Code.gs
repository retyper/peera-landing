/**
 * 피어라 사전예약 폼 → Google 시트 저장용 Apps Script.
 * 배포 방법은 README.md "이메일 수집 연결 (Google 시트)" 참고.
 *
 * 이 스크립트를 붙여 넣기 전에, 대상 스프레드시트 1행(헤더)에 아래 이름 그대로
 * 열을 만들어 둘 것 (순서는 상관없다 — 헤더 "이름"으로 값을 찾아 넣는다):
 *   타임스탬프 | email | 신청위치 | 유입경로 | 개인정보동의 | raw
 *
 * raw 열에는 그 요청에 실려 온 모든 필드가 JSON 그대로 들어간다 —
 * 위 헤더에 없는 값(_subject 등)이나 나중에 폼에 필드를 추가했을 때도 유실 없이 남는다.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var params = (e && e.parameter) || {};

    // 스팸 트랩: 사람 눈에 안 보이는 _gotcha 칸이 채워져 있으면 봇 → 시트에 남기지 않고 조용히 성공 처리
    if (params['_gotcha']) {
      return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow() + 1;

    var row = headers.map(function (h) {
      if (h === '타임스탬프') return new Date();
      if (h === 'raw') return JSON.stringify(params);
      return params[h] || '';
    });
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

    // Formspree가 하던 "신청 오면 메일로 알림"을 대신한다. 안 받고 싶으면 이 블록만 지우면 됨.
    try {
      MailApp.sendEmail(
        'retyper92@gmail.com',
        params['_subject'] || '[피어라] 사전예약 신청',
        'email: ' + (params['email'] || '') +
          '\n신청위치: ' + (params['신청위치'] || '') +
          '\n유입경로: ' + (params['유입경로'] || '')
      );
    } catch (mailErr) {
      // 메일 발송 실패해도 시트 저장은 이미 끝났으니 신청 자체는 성공으로 본다.
    }

    return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
