import axios from 'axios'
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

async function login(studentId, password) {
  const loginResult = await axios.post('/pyxis-api/api/login', {
    "isFamilyLogin": false,
    "isMobile": true,
    "loginId": studentId,
    "password": password
  })

  if (loginResult.data.success && loginResult.data.data?.accessToken)
    return loginResult.data.data.accessToken
  else {
    throw new Error("로그인 실패 ")
  }
}

async function getMembershipInfo(token) {
  const membershipInfo = await axios.get('/pyxis-api/1/api/my-membership-card', { headers: { 'Pyxis-Auth-Token': token } })

  if (membershipInfo.data?.success)
    return membershipInfo.data?.data
  else {
    throw new Error("로그인 필요.")
  }
}

function App() {
  const [barcode, setBarcode] = useState(null)
  const tryLogin = async (id, pw) => {
    const token = await login(id, pw)
    localStorage.setItem('token', token)
    return token
  }
  const tryGetMembershipInfo = async (token) => {
    if (!token) throw new Error("토큰 없음")
    const membershipInfo = await getMembershipInfo(token)
    setBarcode(membershipInfo?.membershipCard)
  }
  const checkLogin = async function () {
    const token = localStorage.getItem("token")
    try {
      await tryGetMembershipInfo(token)
    } catch (e) {
      const id = localStorage.getItem('studentId')
      const pw = localStorage.getItem('password')
      if (id && pw)
        tryLogin(id, pw)
    }
  }
  useEffect(() => {
    checkLogin()
  }, [])

  const [form, setForm] = useState({
    studentId: '',
    password: '',
  });


  return (
    <div className="App" style={{ height: '100vh', display:'flex' }}>
      {
        barcode &&
        <div style={{ padding: 24, flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <QRCodeSVG value={barcode} />
          <br />
          <button onClick={() => { localStorage.clear(); setBarcode(null) }}>로그아웃</button>
        </div>
      }
      {
        !barcode &&
        <div style={{ padding: 24 }}>
          <p>
            <label>학번 </label>
            <input value={form.studentId} onChange={(e) => setForm(prev => ({ ...prev, studentId: e.target.value }))} placeholder='학번' />
          </p>
          <p>
            <label>비밀번호 </label>
            <input type="password" value={form.password} onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))} placeholder='비밀번호' />
          </p>
          <button onClick={async () => {
            try {
              const token = await tryLogin(form.studentId, form.password)
              await tryGetMembershipInfo(token)
              setForm({ studentId: '', password: '' })
            } catch (e) {
              alert("로그인 실패")
            }
          }}>확인</button>
          <p>당신의 학번과 비밀번호는 오직 인천대학교 서버와만 통신합니다.<br /> 제가 당신 계정 알아서 뭐하게요.</p>
        </div>
      }


    </div>
  );
}

export default App;
