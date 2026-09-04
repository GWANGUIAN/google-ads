import type { Locale } from "@/i18n/config";

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: Record<Locale, FaqItem[]> = {
  ko: [
    {
      question: "정말 제 비밀번호가 서버로 전송되지 않나요?",
      answer:
        "네. 브라우저 안에서 비밀번호를 SHA-1 해시로 변환한 뒤, 그 해시값의 앞 5자리만 서버로 보내요. 서버는 같은 앞자리를 가진 수백 개의 해시 목록을 돌려줄 뿐, 실제 비밀번호나 전체 해시값은 절대 알 수 없어요. 이 방식을 'k-익명성'이라고 하며, 자세한 원리는 가이드 문서에서 확인하실 수 있어요.",
    },
    {
      question: "이 서비스는 어떤 데이터베이스를 사용하나요?",
      answer:
        "전 세계적으로 널리 사용되는 'Have I Been Pwned'의 Pwned Passwords 데이터베이스를 이용해요. 수십억 건의 실제 유출 비밀번호를 기반으로 합니다.",
    },
    {
      question: "비밀번호가 '안전함'으로 나오면 100% 안전한가요?",
      answer:
        "이 결과는 해당 비밀번호가 지금까지 알려진 유출 사고에 포함되지 않았다는 뜻이에요. 완벽한 보장은 아니며, 여러 사이트에서 같은 비밀번호를 재사용하지 않고 충분히 복잡한 비밀번호를 쓰는 것이 여전히 중요해요.",
    },
    {
      question: "확인 후 입력한 비밀번호는 저장되나요?",
      answer:
        "아니요. 페이지를 벗어나거나 새로고침하면 입력한 비밀번호는 브라우저 메모리에서 사라져요. 어떤 서버에도, 어떤 형태로도 저장되지 않습니다.",
    },
    {
      question: "비밀번호 강도는 어떻게 계산되나요?",
      answer:
        "업계에서 널리 쓰이는 zxcvbn 알고리즘을 사용해 길이, 문자 조합, 흔한 패턴 등을 종합적으로 분석해요. 이 계산 역시 100% 브라우저 안에서만 이루어집니다.",
    },
  ],
  en: [
    {
      question: "Is my password really never sent to a server?",
      answer:
        "Correct. Your browser hashes the password with SHA-1 locally, and only sends the first 5 characters of that hash to our server. The server returns hundreds of hashes sharing that prefix — it never learns your actual password or full hash. This is called \"k-anonymity,\" and you can read the full mechanism in our guides.",
    },
    {
      question: "What database does this use?",
      answer:
        "We use the widely-trusted \"Have I Been Pwned\" Pwned Passwords database, built from billions of real breached passwords.",
    },
    {
      question: "If it says \"safe,\" is my password 100% secure?",
      answer:
        "It means this password hasn't appeared in any breach known so far — not an absolute guarantee. It's still important to use a sufficiently complex password and avoid reusing it across sites.",
    },
    {
      question: "Is the password I typed stored anywhere afterward?",
      answer:
        "No. Once you leave or refresh the page, the password you typed is gone from browser memory. It's never stored anywhere, in any form.",
    },
    {
      question: "How is password strength calculated?",
      answer:
        "We use the widely-used zxcvbn algorithm, which analyzes length, character variety, and common patterns together. This calculation also happens 100% inside your browser.",
    },
  ],
};
