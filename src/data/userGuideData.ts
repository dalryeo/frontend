export type UserGuideKey = 'terms' | 'privacy';

export type GuideItem =
  | { type: 'heading'; text: string }
  | { type: 'body'; text: string }
  | { type: 'bullet'; text: string; indent?: number }
  | { type: 'numbered'; number: string; text: string; indent?: number };

export interface UserGuideData {
  title: string;
  items: GuideItem[];
}

export const userGuideData: Record<UserGuideKey, UserGuideData> = {
  terms: {
    title: '서비스 이용약관',
    items: [
      { type: 'heading', text: '제1조 (목적)' },
      {
        type: 'body',
        text: '본 약관은 달려 운영자(이하 "운영자")가 제공하는 달려 서비스(이하 "서비스")의 이용과 관련하여 운영자와 회원 간의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.',
      },

      { type: 'heading', text: '제2조 (정의)' },
      {
        type: 'numbered',
        number: '1.',
        text: '"서비스"란 운영자가 제공하는 달려 앱 및 이에 부수하는 제반 서비스(러닝 기록 관리, 티어 산정, 랭킹 제공 등)를 말합니다.',
      },
      {
        type: 'numbered',
        number: '2.',
        text: '"회원"이란 본 약관에 동의하고 소셜 로그인 방식(Apple/Google 등)으로 계정을 생성하여 서비스를 이용하는 자를 말합니다.',
      },
      {
        type: 'numbered',
        number: '3.',
        text: '"계정"이란 회원 식별 및 서비스 이용을 위해 필요한 인증 정보(소셜 로그인 식별자 등)를 말합니다.',
      },
      {
        type: 'numbered',
        number: '4.',
        text: '"러닝 기록(세션)"이란 회원이 서비스 또는 기기에서 생성하거나 iOS HealthKit 등 외부 플랫폼을 통해 연동된 운동 데이터를 말합니다(예: 거리, 페이스, 시간 등).',
      },
      {
        type: 'numbered',
        number: '5.',
        text: '"티어(등급)"란 주간 기록을 기반으로 서비스가 산정하여 회원에게 부여하는 실력 지표를 말합니다.',
      },
      {
        type: 'numbered',
        number: '6.',
        text: '"랭킹"이란 주간 기록을 기반으로 산정되는 순위 정보(예: 전체 랭킹, 백분위 등)를 말합니다.',
      },

      { type: 'heading', text: '제3조 (약관의 효력 및 변경)' },
      {
        type: 'numbered',
        number: '1.',
        text: '본 약관은 회원이 약관에 동의하고 회원가입을 완료한 때 효력이 발생합니다.',
      },
      {
        type: 'numbered',
        number: '2.',
        text: '운영자는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일 및 변경 사유를 서비스 내 공지 등 합리적인 방법으로 사전 고지합니다.',
      },
      {
        type: 'numbered',
        number: '3.',
        text: '회원이 변경 약관에 동의하지 않는 경우 서비스 이용을 중단하고 이용계약을 해지(탈퇴)할 수 있습니다. 변경 시행일 이후에도 서비스를 계속 이용하는 경우 변경 약관에 동의한 것으로 봅니다.',
      },

      { type: 'heading', text: '제4조 (개인정보보호 및 운영정책)' },
      {
        type: 'numbered',
        number: '1.',
        text: '운영자는 개인정보 보호 관련 법령을 준수하며, 개인정보의 처리에 관한 사항은 "개인정보 처리방침" 및 서비스 내 안내에 따릅니다.',
      },
      {
        type: 'numbered',
        number: '2.',
        text: '운영자는 서비스 운영을 위해 필요한 세부 정책(예: 랭킹/티어 산정 기준, 기록 제외 기준, 닉네임 규칙, 제재 기준, 권한 안내 등)을 "운영정책"으로 정하여 서비스 내 공지할 수 있으며, 회원은 이를 준수하여야 합니다.',
      },
      {
        type: 'numbered',
        number: '3.',
        text: '약관에서 정하지 않은 사항은 개인정보 처리방침 및 운영정책, 관련 법령에 따릅니다.',
      },

      { type: 'heading', text: '제5조 (회원가입)' },
      {
        type: 'numbered',
        number: '1.',
        text: '회원가입은 회원이 본 약관에 동의하고 소셜 로그인을 완료함으로써 성립합니다.',
      },
      {
        type: 'numbered',
        number: '2.',
        text: '운영자는 서비스 제공을 위해 필요한 최소한의 정보(예: 닉네임, 프로필 이미지, 기기 권한 등)를 요청할 수 있습니다.',
      },
      {
        type: 'numbered',
        number: '3.',
        text: '서비스는 만 14세 이상만 가입 및 이용할 수 있습니다. 회원은 회원가입 시 본인의 연령이 위 기준을 충족함을 확인·보증합니다.',
      },
      {
        type: 'numbered',
        number: '4.',
        text: '운영자는 회원이 만 14세 미만으로 확인되거나 합리적으로 의심되는 경우, 해당 회원의 서비스 이용을 제한하거나 이용계약을 해지(탈퇴 처리)할 수 있습니다.',
      },

      { type: 'heading', text: '제6조 (회원정보 변경)' },
      {
        type: 'numbered',
        number: '1.',
        text: '회원은 서비스 내 설정 기능 등을 통해 닉네임, 프로필 이미지 등 일부 정보를 변경할 수 있습니다.',
      },
      {
        type: 'numbered',
        number: '2.',
        text: '회원은 자신의 정보를 최신 상태로 유지할 책임이 있으며, 미변경으로 인한 불이익은 회원의 책임입니다.',
      },
      {
        type: 'numbered',
        number: '3.',
        text: '운영자는 정책 위반(욕설/혐오/사칭/불법 등) 닉네임·프로필 이미지에 대해 수정 요청 또는 이용 제한 조치를 할 수 있습니다.',
      },

      { type: 'heading', text: '제7조 (회사의 권리와 의무)' },
      {
        type: 'numbered',
        number: '1.',
        text: '운영자는 안정적인 서비스 제공을 위해 노력하며, 장애·점검·업데이트 등 필요한 조치를 취할 수 있습니다.',
      },
      {
        type: 'numbered',
        number: '2.',
        text: '운영자는 무료 서비스의 특성상 서비스의 기능, UI, 제공 범위, 운영 방식 등을 개선·변경할 수 있습니다.',
      },
      {
        type: 'numbered',
        number: '3.',
        text: '운영자는 회원의 약관/운영정책 위반 행위가 확인되는 경우, 경고, 기록 제외, 랭킹 제외, 계정 제한 등 합리적인 범위의 제재를 할 수 있습니다.',
      },
      {
        type: 'numbered',
        number: '4.',
        text: '운영자는 고객 문의 및 고지를 위해 카카오 1:1 오픈채팅 등 안내된 채널을 운영할 수 있습니다.',
      },

      { type: 'heading', text: '제8조 (회원의 권리와 의무)' },
      {
        type: 'numbered',
        number: '1.',
        text: '회원은 서비스를 이용할 권리를 가지며, 약관/운영정책 및 관련 법령을 준수해야 합니다.',
      },
      {
        type: 'numbered',
        number: '2.',
        text: '회원은 다음 행위를 하여서는 안 됩니다.',
      },
      {
        type: 'numbered',
        number: 'a.',
        text: '타인의 계정 도용, 사칭, 개인정보 침해',
        indent: 1,
      },
      {
        type: 'numbered',
        number: 'b.',
        text: '서비스 운영 방해(비정상 트래픽, 자동화 수단 사용, 리버스 엔지니어링 등)',
        indent: 1,
      },
      {
        type: 'numbered',
        number: 'c.',
        text: '기록 조작/허위 데이터 생성 등 랭킹·티어 부정 취득',
        indent: 1,
      },
      {
        type: 'numbered',
        number: 'd.',
        text: '기타 법령 또는 약관/운영정책 위반',
        indent: 1,
      },
      {
        type: 'numbered',
        number: '3.',
        text: '회원은 자신의 건강 상태를 고려하여 운동을 수행해야 하며, 이상 증상이 있을 경우 즉시 중단하고 전문가 상담을 권장합니다.',
      },
      {
        type: 'numbered',
        number: '4.',
        text: '운영자는 서비스가 의료행위 또는 의학적 진단·치료를 제공하지 않음을 고지하며, 회원은 이를 이해하고 이용합니다.',
      },

      { type: 'heading', text: '제9조 (서비스의 제공)' },
      {
        type: 'numbered',
        number: '1.',
        text: '운영자는 회원에게 다음 기능을 제공할 수 있습니다.',
      },
      {
        type: 'numbered',
        number: 'a.',
        text: '러닝 기록 생성/저장(거리, 페이스, 시간 등)',
        indent: 1,
      },
      {
        type: 'numbered',
        number: 'b.',
        text: '기기 권한(예: 위치 권한)을 통한 기록 측정',
        indent: 1,
      },
      {
        type: 'numbered',
        number: 'c.',
        text: 'HealthKit(해당 시) 등 외부 플랫폼 연동을 통한 기록 동기화',
        indent: 1,
      },
      {
        type: 'numbered',
        number: 'd.',
        text: '주간 티어 산정 및 히스토리 제공',
        indent: 1,
      },
      {
        type: 'numbered',
        number: 'e.',
        text: '주간 랭킹 및 백분위 제공',
        indent: 1,
      },
      {
        type: 'numbered',
        number: '2.',
        text: '랭킹 노출 항목은 기본적으로 다음 정보가 포함될 수 있습니다.',
      },
      {
        type: 'bullet',
        text: '닉네임 / 프로필 이미지 / 티어 / 페이스 / 거리',
        indent: 1,
      },
      {
        type: 'numbered',
        number: '3.',
        text: '서비스의 일부 기능은 OS/기기/권한 설정에 따라 제한될 수 있습니다.',
      },

      { type: 'heading', text: '제10조 (서비스의 변경 및 중단)' },
      {
        type: 'numbered',
        number: '1.',
        text: '운영자는 서비스 개선, 장애, 점검, 정책 변경 등의 사유로 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.',
      },
      {
        type: 'numbered',
        number: '2.',
        text: '사전 공지가 가능한 경우 사전 공지하며, 긴급 또는 불가피한 경우 사후 공지할 수 있습니다.',
      },
      {
        type: 'numbered',
        number: '3.',
        text: '서비스는 무료로 제공되며, 법령상 특별한 규정이 없는 한 서비스 변경·중단에 대해 운영자는 별도 보상 의무를 지지 않습니다.',
      },

      { type: 'heading', text: '제11조 (서비스 이용 해지)' },
      {
        type: 'numbered',
        number: '1.',
        text: '회원은 언제든지 서비스 내 탈퇴 기능을 통해 이용계약을 해지(탈퇴)할 수 있습니다.',
      },
      {
        type: 'numbered',
        number: '2.',
        text: '탈퇴 시 회원의 계정 및 서비스 내 저장 데이터는 즉시 삭제됩니다.',
      },
      {
        type: 'bullet',
        text: '단, 관련 법령에 따라 보관이 필요한 정보가 있는 경우, 해당 법령이 정한 기간 동안 보관 후 삭제할 수 있습니다.',
        indent: 1,
      },
      {
        type: 'numbered',
        number: '3.',
        text: '탈퇴 후 데이터는 복구가 불가능할 수 있으므로, 회원은 탈퇴 전 이를 충분히 확인해야 합니다.',
      },

      { type: 'heading', text: '제12조 (회사의 면책)' },
      {
        type: 'numbered',
        number: '1.',
        text: '운영자는 천재지변, 통신 장애, 플랫폼(Apple/Google/HealthKit 등) 정책 변경 등 불가항력으로 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.',
      },
      {
        type: 'numbered',
        number: '2.',
        text: 'GPS/센서/기기/연동 플랫폼의 오차로 인해 기록, 티어, 랭킹에 오류가 발생할 수 있으며, 운영자는 고의 또는 중대한 과실이 없는 한 이에 대한 책임을 지지 않습니다.',
      },
      {
        type: 'numbered',
        number: '3.',
        text: '운영자는 회원의 귀책사유로 인한 서비스 이용 장애, 손해에 대해 책임을 지지 않습니다.',
      },
      {
        type: 'numbered',
        number: '4.',
        text: '서비스는 운동 기록·동기부여를 위한 도구로 제공되며, 회원의 운동 수행 및 그 결과는 회원의 책임입니다.',
      },

      { type: 'heading', text: '제13조 (저작권)' },
      {
        type: 'numbered',
        number: '1.',
        text: '서비스의 명칭("달려"), 로고(존재 시), 앱 화면(UI), 디자인, 소프트웨어, 기능 구성 등 운영자가 제공하는 서비스 구성 요소에 대한 지식재산권은 운영자 또는 정당한 권리자에게 귀속됩니다.',
      },
      {
        type: 'numbered',
        number: '2.',
        text: '회원은 운영자의 사전 동의 없이 서비스 구성 요소를 복제, 배포, 전송, 변형하거나 상업적으로 이용할 수 없습니다.',
      },

      { type: 'heading', text: '제14조 (재판권 및 준거법)' },
      {
        type: 'numbered',
        number: '1.',
        text: '본 약관 및 서비스 이용에 관한 분쟁에는 대한민국 법령이 적용됩니다.',
      },
      {
        type: 'numbered',
        number: '2.',
        text: '운영자와 회원 간 소송이 제기되는 경우, 민사소송법 등 관계 법령에 따른 관할 법원을 관할 법원으로 합니다.',
      },

      { type: 'heading', text: '제15조 (분쟁해결)' },
      {
        type: 'numbered',
        number: '1.',
        text: '운영자와 회원은 서비스 이용과 관련한 분쟁을 원만히 해결하기 위해 성실히 협의합니다.',
      },
      {
        type: 'numbered',
        number: '2.',
        text: '회원은 고객센터(카카오 1:1 오픈채팅)를 통해 문의할 수 있으며, 운영자는 합리적인 범위에서 분쟁 해결을 위해 노력합니다.',
      },
    ],
  },

  privacy: {
    title: '개인정보 처리 방침',
    items: [
      { type: 'heading', text: '1) 개인정보 처리목적' },
      {
        type: 'body',
        text: '운영자는 이용자의 개인정보를 다음 목적을 위해 처리합니다.',
      },
      {
        type: 'numbered',
        number: '1.',
        text: '회원 가입 및 관리: 소셜 로그인 기반 이용자 식별·인증, 계정 생성·유지, 부정 이용 방지',
      },
      {
        type: 'numbered',
        number: '2.',
        text: '연령 확인: 서비스 가입 가능 연령(만 14세 이상) 확인',
      },
      {
        type: 'numbered',
        number: '3.',
        text: '서비스 제공: 러닝 기록 저장·조회, 티어 산정, 랭킹 산정 및 표시',
      },
      {
        type: 'numbered',
        number: '4.',
        text: '고객 문의 대응: 문의·요청 처리, 분쟁 대응',
      },
      {
        type: 'numbered',
        number: '5.',
        text: '서비스 안정성 및 보안: 오류·장애 대응, 최소한의 로그 확인',
      },

      { type: 'heading', text: '2) 개인정보 처리 및 보유기간' },
      {
        type: 'body',
        text: '운영자는 원칙적으로 이용자가 회원에서 탈퇴하거나 개인정보의 수집·이용 목적이 달성되면 지체 없이 파기합니다.',
      },
      {
        type: 'body',
        text: '다만, 관련 법령에 따라 보존할 필요가 있는 경우에는 해당 법령에서 정한 기간 동안 안전하게 보관합니다.',
      },
      {
        type: 'bullet',
        text: '회원 정보 및 서비스 이용 데이터(계정/생년월일/러닝 기록 등): 탈퇴 시 즉시 삭제',
      },
      {
        type: 'bullet',
        text: '고객 문의 내역(오픈채팅 대화 및 첨부자료 등): 문의 처리 완료 후 지체 없이 삭제(분쟁 대응이 필요한 경우에 한해 최소 기간 보관 가능)',
      },

      { type: 'heading', text: '3) 처리하는 개인정보 항목' },
      {
        type: 'body',
        text: '운영자는 회원가입, 서비스 제공, 고객 문의 응대를 위해 아래 개인정보를 처리할 수 있습니다.',
      },
      { type: 'numbered', number: '1.', text: '회원가입/계정 정보(필수)' },
      {
        type: 'bullet',
        text: '소셜 로그인 식별 정보(Apple/Google 등에서 제공하는 고유 식별자)',
        indent: 1,
      },
      { type: 'bullet', text: '닉네임', indent: 1 },
      {
        type: 'bullet',
        text: '생년월일(만 14세 이상 가입 여부 확인 포함)',
        indent: 1,
      },
      { type: 'bullet', text: '프로필 이미지(회원이 설정한 경우)', indent: 1 },
      { type: 'numbered', number: '2.', text: '서비스 이용 정보(생성 정보)' },
      {
        type: 'bullet',
        text: '러닝 기록 데이터(예: 거리, 페이스, 시간 등)',
        indent: 1,
      },
      {
        type: 'bullet',
        text: '랭킹 노출 정보: 닉네임 / 프로필 이미지 / 티어 / 페이스 / 거리',
        indent: 1,
      },
      {
        type: 'numbered',
        number: '3.',
        text: '서비스 운영·보안 목적의 최소 정보(자동 생성)',
      },
      {
        type: 'bullet',
        text: '접속 일시, 오류/크래시 정보, 기기/OS 정보, 앱 버전 등(필요 최소 범위)',
        indent: 1,
      },
      { type: 'numbered', number: '4.', text: '고객 문의(선택)' },
      {
        type: 'bullet',
        text: '이용자가 오픈채팅 문의 과정에서 제공하는 정보(문의 내용, 스크린샷 등)',
        indent: 1,
      },
      {
        type: 'body',
        text: '※ 달려는 만 14세 이상만 가입 및 이용 가능합니다.',
      },

      { type: 'heading', text: '4) 개인정보처리 위탁' },
      {
        type: 'body',
        text: '운영자는 원칙적으로 이용자의 개인정보 처리를 외부에 위탁하지 않습니다.',
      },
      { type: 'bullet', text: '현재 위탁: 없음' },
      {
        type: 'bullet',
        text: '향후 서비스 제공을 위해 위탁이 필요한 경우, 위탁받는 자와 위탁업무 내용 등을 사전에 고지하고 관련 법령에 따른 절차를 이행합니다.',
      },

      { type: 'heading', text: '5) 개인정보의 국외 이전에 관한 사항' },
      {
        type: 'body',
        text: '운영자는 이용자의 개인정보를 국외로 이전하지 않습니다.',
      },
      { type: 'bullet', text: '현재 국외이전 : 없음' },
      { type: 'bullet', text: '서버/저장소 위치 : 국내' },

      {
        type: 'heading',
        text: '6) 정보주체와 법정대리인의 권리, 의무 및 행사방법 관한 사항',
      },
      {
        type: 'body',
        text: '이용자는 개인정보에 대해 언제든지 열람, 정정, 삭제, 처리정지를 요청할 수 있으며 운영자는 지체 없이 조치합니다.',
      },
      {
        type: 'bullet',
        text: '요청 방법 : 서비스 내 설정/탈퇴 기능 또는 고객센터(카카오 1:1 오픈채팅)',
      },
      {
        type: 'body',
        text: '또한 이용자가 개인정보 삭제를 요청하는 경우, 운영자는 회원 탈퇴 절차 안내 및 탈퇴 처리를 통해 조치할 수 있습니다.',
      },
      {
        type: 'body',
        text: '※ 달려는 만 14세 이상 가입 서비스이므로 원칙적으로 법정대리인 동의/권리 행사 대상이 아닙니다. 만 14세 미만 이용이 확인되거나 합리적으로 의심되는 경우, 운영자는 이용 제한 및 개인정보 삭제 등 필요한 조치를 할 수 있습니다.',
      },

      { type: 'heading', text: '7) 개인정보의 파기절차 및 방법에 관한 사항' },
      {
        type: 'body',
        text: '이용자의 개인정보는 원칙적으로 수집·이용 목적이 달성되면 지체 없이 파기됩니다. 파기절차 및 방법은 다음과 같습니다.',
      },
      {
        type: 'bullet',
        text: '파기절차 : 회원가입 등으로 입력/생성된 정보는 목적 달성 또는 탈퇴 시 즉시 삭제(파기)됩니다. 다만 법령에 따라 보관이 필요한 경우에는 해당 정보는 별도로 안전하게 보관 후 기간 경과 시 파기됩니다.',
      },
      {
        type: 'bullet',
        text: '파기방법 : 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.',
      },

      { type: 'heading', text: '8) 개인정보 보호책임자' },
      {
        type: 'body',
        text: '개인정보보호 관련 문의 및 불만처리, 피해구제를 위하여 아래와 같이 개인정보 보호책임자를 지정합니다.',
      },
      { type: 'bullet', text: '개인정보 보호책임자: 달려 운영자' },
      {
        type: 'bullet',
        text: '문의 채널: 카카오 1:1 오픈채팅 https://open.kakao.com/o/sgQw0dhi',
      },

      { type: 'heading', text: '9) 개인정보의 안전성 확보에 관한 사항' },
      {
        type: 'body',
        text: '운영자는 개인정보 보호를 위해 다음과 같은 조치를 취하고 있습니다.',
      },
      { type: 'bullet', text: '?' },

      { type: 'heading', text: '10) 정보주체의 권익침해에 대한 구제방법' },
      {
        type: 'body',
        text: '이용자는 개인정보 침해로 인한 신고·상담이 필요한 경우 아래 기관에 문의할 수 있습니다.',
      },
      { type: 'bullet', text: '개인정보침해신고센터(한국인터넷진흥원)' },
      { type: 'bullet', text: '개인정보 분쟁조정위원회' },
      { type: 'bullet', text: '대검찰청/경찰청 사이버 관련 부서 등' },
      {
        type: 'body',
        text: '또한 이용자는 고객센터(카카오 1:1 오픈채팅)를 통해 운영자에게 직접 문의할 수 있으며, 운영자는 확인 후 안내합니다.',
      },

      { type: 'heading', text: '11) 개인정보 처리방침 변경' },
      {
        type: 'body',
        text: '본 개인정보 처리방침의 내용 추가, 삭제 및 수정이 있을 경우 운영자는 변경사항의 시행일 및 변경사유를 명시하여 서비스 내 공지 등 합리적인 방법으로 고지합니다.',
      },
    ],
  },
};
