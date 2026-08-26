import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  uid: string;
  name: string;
  email: string;
  password: string;
  wallet: number;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  totalEarned: number;
  joinDate: string;
  status: 'active' | 'blocked';
  phone: string;
}

interface GroupRequest {
  id: number;
  groupName: string;
  player1: string;
  player1Uid: string;
  player1Phone: string;
  player2: string;
  player2Uid: string;
  player2Phone: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  groupLink?: string;
}

interface MatchRequest {
  id: number;
  userId: number;
  userUid: string;
  userName: string;
  userPhone: string;
  amount: number;
  status: 'waiting' | 'matched';
  opponentId?: number;
  opponentUid?: string;
  opponentName?: string;
  opponentPhone?: string;
  date: string;
}

interface RechargeRequest {
  id: number;
  userId: number;
  userUid: string;
  userName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  message: string;
}

const ADMIN_WHATSAPP = '212604084574';

// ✅ دالة الحفظ - كترسل البيانات للسيرفر
const saveData = async (key: string, data: any) => {
  try {
    if (key === 'users') {
      await fetch('http://localhost:4000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else if (key === 'groupRequests') {
      await fetch('http://localhost:4000/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else if (key === 'matchRequests') {
      await fetch('http://localhost:4000/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else if (key === 'rechargeRequests') {
      await fetch('http://localhost:4000/api/recharges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
  } catch (err) {
    console.log('Failed to save to server', err);
  }
};

// ✅ دالة التحميل - كتجبد البيانات من السيرفر
const loadData = (key: string, defaultData: any) => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { return defaultData; }
  }
  return defaultData;
};

const generateUID = (count: number) => {
  const num = String(count + 1).padStart(4, '0');
  return `#ES-${num}`;
};

const generateGroupName = (groups: GroupRequest[]) => {
  const numbers = groups.map(g => {
    const num = parseInt(g.groupName.replace('MR-', ''));
    return isNaN(num) ? 0 : num;
  });
  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `MR-${maxNum + 1}`;
};

// ======================== صفحة تسجيل الدخول ========================
const LoginPage = ({ onLogin, users, setUsers }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (isSignUp) {
        if (!phone) {
          alert('❌ من فضلك أدخل رقم هاتفك (واتساب)');
          setLoading(false);
          return;
        }
        const newUser: User = {
          id: Date.now(),
          uid: generateUID(users.length),
          name: name || email.split('@')[0],
          email,
          password,
          wallet: 0,
          totalMatches: 0,
          totalWins: 0,
          totalLosses: 0,
          totalEarned: 0,
          joinDate: new Date().toLocaleDateString(),
          status: 'active',
          phone: phone,
        };
        const existingUser = users.find((u: User) => u.email === email);
        if (existingUser) {
          alert('❌ هذا الإيميل مسجل بالفعل!');
          setLoading(false);
          return;
        }
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        saveData('users', updatedUsers);
        alert(`✅ تم إنشاء الحساب بنجاح!\n🆔 رقمك: ${newUser.uid}\n📱 هاتفك: ${phone}`);
        setIsSignUp(false);
        setLoading(false);
        return;
      }
      const user = users.find((u: User) => u.email === email && u.password === password);
      if (user) {
        if (user.status === 'blocked') {
          alert('❌ هذا الحساب محظور!');
          setLoading(false);
          return;
        }
        onLogin(user);
      } else {
        alert('❌ إيميل أو كلمة مرور خاطئة!');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-4xl font-bold text-white">eSport</h1>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Betting Arena</h2>
          <p className="text-white/40 text-sm mt-2">{isSignUp ? 'أنشئ حسابك الجديد' : 'مرحباً بعودتك'}</p>
        </div>
        <div className="bg-card rounded-2xl p-8 border border-white/5 glow">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-white/70 text-sm mb-2">الاسم</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary transition" placeholder="اسمك" required />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">رقم الهاتف (واتساب)</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary transition" placeholder="212600000000" required />
                </div>
              </>
            )}
            <div>
              <label className="block text-white/70 text-sm mb-2">البريد الإلكتروني</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary transition" placeholder="example@email.com" required />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">كلمة المرور</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary transition" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-secondary py-3 rounded-xl text-white font-semibold transition hover:scale-[1.02]">
              {loading ? 'جاري التحميل...' : isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-white/30 text-sm hover:text-primary transition">
              {isSignUp ? 'لديك حساب؟ سجل دخول' : 'ليس لديك حساب؟ أنشئ حساب'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ======================== لوحة تحكم الإدمن ========================
const AdminPanel = ({ users, setUsers, groupRequests, setGroupRequests, rechargeRequests, setRechargeRequests, matchRequests, onLogout, refreshUsers }: any) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [addAmount, setAddAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [groupLink, setGroupLink] = useState('');
  const [showPassword, setShowPassword] = useState<number | null>(null);

  const filteredUsers = users.filter((u: User) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateWallet = (userId: number, amount: number) => {
    const updatedUsers = users.map((u: User) =>
      u.id === userId ? { ...u, wallet: Math.max(0, u.wallet + amount) } : u
    );
    setUsers(updatedUsers);
    saveData('users', updatedUsers);
    setAddAmount(0);
    setSelectedUser(null);
    const user = users.find((u: User) => u.id === userId);
    alert(`✅ تم ${amount > 0 ? 'إضافة' : 'خصم'} $${Math.abs(amount).toFixed(2)} من محفظة ${user?.uid}`);
  };

  const toggleUserStatus = (userId: number) => {
    const updatedUsers = users.map((u: User) =>
      u.id === userId ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u
    );
    setUsers(updatedUsers);
    saveData('users', updatedUsers);
  };

  const approveGroup = (requestId: number) => {
    const request = groupRequests.find((r: any) => r.id === requestId);
    if (!request) return;
    if (!groupLink) {
      alert('❌ من فضلك أدخل رابط مجموعة واتساب');
      return;
    }
    const updatedRequests = groupRequests.map((r: any) =>
      r.id === requestId ? { ...r, status: 'approved', groupLink: groupLink } : r
    );
    setGroupRequests(updatedRequests);
    saveData('groupRequests', updatedRequests);
    setGroupLink('');
    const message = encodeURIComponent(
      `📋 تم إنشاء مجموعتك!\n🔗 رابط المجموعة: ${groupLink}\n👤 ${request.player1} vs ${request.player2}\n💰 المبلغ: $${request.amount}`
    );
    window.open(`https://wa.me/${request.player1Phone}?text=${message}`, '_blank');
    window.open(`https://wa.me/${request.player2Phone}?text=${message}`, '_blank');
    alert(`✅ تمت الموافقة على المجموعة ${request.groupName}!`);
  };

  const rejectGroup = (requestId: number) => {
    const updatedRequests = groupRequests.map((r: any) =>
      r.id === requestId ? { ...r, status: 'rejected' } : r
    );
    setGroupRequests(updatedRequests);
    saveData('groupRequests', updatedRequests);
    alert('❌ تم رفض طلب المجموعة');
  };

  const approveRecharge = (requestId: number) => {
    const request = rechargeRequests.find((r: any) => r.id === requestId);
    if (!request) return;
    const updatedUsers = users.map((u: User) =>
      u.id === request.userId ? { ...u, wallet: u.wallet + request.amount } : u
    );
    setUsers(updatedUsers);
    saveData('users', updatedUsers);
    const updatedRequests = rechargeRequests.map((r: any) =>
      r.id === requestId ? { ...r, status: 'approved' } : r
    );
    setRechargeRequests(updatedRequests);
    saveData('rechargeRequests', updatedRequests);
    alert(`✅ تمت الموافقة على طلب شحن $${request.amount} لـ ${request.userUid}`);
  };

  const rejectRecharge = (requestId: number) => {
    const updatedRequests = rechargeRequests.map((r: any) =>
      r.id === requestId ? { ...r, status: 'rejected' } : r
    );
    setRechargeRequests(updatedRequests);
    saveData('rechargeRequests', updatedRequests);
    alert('❌ تم رفض طلب الشحن');
  };

  const pendingGroups = groupRequests.filter((r: any) => r.status === 'pending');
  const pendingRecharges = rechargeRequests.filter((r: any) => r.status === 'pending');
  const waitingMatches = matchRequests.filter((r: any) => r.status === 'waiting');

  return (
    <div className="min-h-screen bg-dark pb-24">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">⚙️ لوحة التحكم</h1>
            <p className="text-white/40 text-sm">إدارة المستخدمين والمحافظ والمجموعات</p>
          </div>
          <div className="flex gap-2">
            <button onClick={refreshUsers} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition text-sm flex items-center gap-2">
              🔄 تحديث
            </button>
            <button onClick={onLogout} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-white/50 transition text-sm">خروج</button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-card rounded-2xl p-4 border border-white/5 text-center">
            <p className="text-white/40 text-xs">👥 المستخدمين</p>
            <p className="text-white font-bold text-2xl">{users.length}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-white/5 text-center">
            <p className="text-white/40 text-xs">💰 إجمالي المحفظة</p>
            <p className="text-secondary font-bold text-2xl">${users.reduce((sum: number, u: User) => sum + u.wallet, 0).toFixed(2)}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-white/5 text-center">
            <p className="text-white/40 text-xs">📩 طلبات شحن</p>
            <p className="text-yellow-500 font-bold text-2xl">{pendingRecharges.length}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-white/5 text-center">
            <p className="text-white/40 text-xs">🎮 مباريات</p>
            <p className="text-blue-500 font-bold text-2xl">{waitingMatches.length}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-white/5 text-center">
            <p className="text-white/40 text-xs">📋 مجموعات</p>
            <p className="text-green-500 font-bold text-2xl">{pendingGroups.length}</p>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 بحث عن مستخدم (الاسم، الإيميل، ID، أو الهاتف)..."
            className="w-full bg-card border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary transition"
          />
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'users' ? 'bg-primary text-white' : 'bg-card text-white/50 hover:text-white'}`}>👥 المستخدمين</button>
          <button onClick={() => setActiveTab('recharge')} className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${activeTab === 'recharge' ? 'bg-primary text-white' : 'bg-card text-white/50 hover:text-white'}`}>💰 طلبات الشحن {pendingRecharges.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingRecharges.length}</span>}</button>
          <button onClick={() => setActiveTab('groups')} className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${activeTab === 'groups' ? 'bg-primary text-white' : 'bg-card text-white/50 hover:text-white'}`}>📋 مجموعات {pendingGroups.length > 0 && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingGroups.length}</span>}</button>
        </div>

        {activeTab === 'groups' && (
          <div className="bg-card rounded-2xl border border-white/5 p-4">
            <h3 className="text-white font-bold mb-4">📋 طلبات إنشاء مجموعات</h3>
            {pendingGroups.length === 0 ? (
              <p className="text-white/40 text-center py-8">لا توجد طلبات مجموعات</p>
            ) : (
              pendingGroups.map((request: any) => (
                <div key={request.id} className="bg-dark rounded-xl p-4 mb-3 border border-white/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-primary font-bold">{request.groupName}</p>
                      <p className="text-white/40 text-sm">💰 ${request.amount}</p>
                      <p className="text-white/50 text-sm">👤 {request.player1} ({request.player1Uid}) vs {request.player2} ({request.player2Uid})</p>
                      <p className="text-white/30 text-xs">📱 {request.player1Phone} | {request.player2Phone}</p>
                      <p className="text-white/20 text-xs">📅 {request.date}</p>
                    </div>
                    <div>
                      <input type="text" placeholder="رابط المجموعة..." className="bg-dark border border-white/10 rounded-lg px-3 py-1 text-white text-sm w-48 mb-2" onChange={(e) => setGroupLink(e.target.value)} />
                      <div className="flex gap-2">
                        <button onClick={() => approveGroup(request.id)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-4 rounded-xl transition text-sm">✅ قبول</button>
                        <button onClick={() => rejectGroup(request.id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-4 rounded-xl transition text-sm">❌ رفض</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'recharge' && (
          <div className="bg-card rounded-2xl border border-white/5 p-4">
            <h3 className="text-white font-bold mb-4">📩 طلبات الشحن</h3>
            {pendingRecharges.length === 0 ? (
              <p className="text-white/40 text-center py-8">لا توجد طلبات شحن</p>
            ) : (
              pendingRecharges.map((request: any) => (
                <div key={request.id} className="bg-dark rounded-xl p-4 mb-3 border border-white/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-bold">{request.userName}</p>
                      <p className="text-yellow-500 text-xs">🆔 {request.userUid}</p>
                      <p className="text-white/40 text-sm">💰 ${request.amount}</p>
                      <p className="text-white/30 text-sm">📝 "{request.message}"</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveRecharge(request.id)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition text-sm">✅ قبول</button>
                      <button onClick={() => rejectRecharge(request.id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl transition text-sm">❌ رفض</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-dark/50">
                  <tr>
                    <th className="text-right p-3 text-white/40">🆔 ID</th>
                    <th className="text-right p-3 text-white/40">المستخدم</th>
                    <th className="text-right p-3 text-white/40">📧 الإيميل</th>
                    <th className="text-right p-3 text-white/40">🔑 كلمة السر</th>
                    <th className="text-right p-3 text-white/40">📱 الهاتف</th>
                    <th className="text-right p-3 text-white/40">💰 المحفظة</th>
                    <th className="text-right p-3 text-white/40">⚽ مباريات</th>
                    <th className="text-right p-3 text-white/40">الحالة</th>
                    <th className="text-right p-3 text-white/40">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-white/40">لا يوجد مستخدمين</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user: User) => (
                      <tr key={user.id} className="border-t border-white/5 hover:bg-white/5">
                        <td className="p-3 text-yellow-500 font-bold">{user.uid}</td>
                        <td className="p-3 text-white">{user.name}</td>
                        <td className="p-3 text-white/70">{user.email}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-white/50 font-mono">
                              {showPassword === user.id ? user.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => setShowPassword(showPassword === user.id ? null : user.id)}
                              className="text-primary hover:text-primary/80 text-xs"
                            >
                              {showPassword === user.id ? '🙈' : '👁️'}
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(user.password);
                                alert('✅ تم نسخ كلمة السر!');
                              }}
                              className="text-green-500 hover:text-green-400 text-xs"
                            >
                              📋
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-white/60">{user.phone}</td>
                        <td className="p-3 text-secondary font-bold">${user.wallet.toFixed(2)}</td>
                        <td className="p-3 text-white/50">{user.totalMatches}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {user.status === 'active' ? '✅ نشط' : '🚫 محظور'}
                          </span>
                        </td>
                        <td className="p-3">
                          <button onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)} className="bg-gradient-to-r from-primary to-secondary text-white font-semibold py-1 px-3 rounded-xl transition text-xs">إدارة</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-2xl p-6 max-w-md w-full border border-white/10">
              <h3 className="text-white font-bold text-lg mb-4">إدارة {selectedUser.name} <span className="text-yellow-500 text-sm">({selectedUser.uid})</span></h3>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-white/50">المحفظة</span><span className="text-secondary font-bold">${selectedUser.wallet.toFixed(2)}</span></div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">تعديل المحفظة</label>
                  <div className="flex gap-2">
                    <input type="number" value={addAmount} onChange={(e) => setAddAmount(Number(e.target.value))} className="flex-1 bg-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="المبلغ" />
                    <button onClick={() => updateWallet(selectedUser.id, addAmount)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition text-sm">إضافة</button>
                    <button onClick={() => updateWallet(selectedUser.id, -addAmount)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl transition text-sm">خصم</button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleUserStatus(selectedUser.id)} className={`flex-1 py-2 rounded-xl text-white font-semibold ${selectedUser.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                    {selectedUser.status === 'active' ? '🚫 حظر' : '✅ إلغاء الحظر'}
                  </button>
                  <button onClick={() => setSelectedUser(null)} className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-xl text-white/50">إغلاق</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-white/5 flex justify-around items-center py-2 px-4">
          <button className="text-primary flex flex-col items-center gap-1 px-3 py-2"><span className="text-xl">⚙️</span><span className="text-xs">لوحة التحكم</span></button>
          <button onClick={onLogout} className="text-white/40 flex flex-col items-center gap-1 px-3 py-2"><span className="text-xl">🚪</span><span className="text-xs">خروج</span></button>
        </div>
      </div>
    </div>
  );
};

// ======================== شريط التنقل ========================
const NavBar = ({ tabs, activeTab, setActiveTab }: any) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-white/5 flex justify-around items-center py-2 px-4">
      {tabs.map((tab: any) => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition ${activeTab === tab.id ? 'text-primary' : 'text-white/40 hover:text-white/60'}`}>
          <span className="text-xl">{tab.icon}</span>
          <span className="text-xs">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

// ======================== الصفحة الرئيسية للمستخدم ========================
const UserHome = ({ user, onLogout, users, setUsers, matchRequests, setMatchRequests, rechargeRequests, setRechargeRequests, groupRequests, setGroupRequests }: any) => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(10);
  const [rechargeMessage, setRechargeMessage] = useState('');

  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: '🏠' },
    { id: 'play', label: 'لعب', icon: '⚽' },
    { id: 'profile', label: 'الملف', icon: '👤' },
  ];

  const updateUser = (updatedUser: User) => {
    const updatedUsers = users.map((u: User) => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    saveData('users', updatedUsers);
  };

  const findOpponent = () => {
    if (selectedAmount > user.wallet) {
      alert('❌ رصيدك غير كافي!');
      return;
    }
    if (!user.phone) {
      alert('❌ من فضلك أضف رقم هاتفك في الملف الشخصي');
      return;
    }
    setIsSearching(true);
    const existingRequest = matchRequests.find(
      (r: any) => r.amount === selectedAmount && r.status === 'waiting' && r.userId !== user.id
    );
    setTimeout(() => {
      if (existingRequest) {
        const opponent = users.find((u: User) => u.id === existingRequest.userId);
        const groupName = generateGroupName(groupRequests);
        const newGroupRequest = {
          id: Date.now(),
          groupName: groupName,
          player1: user.name,
          player1Uid: user.uid,
          player1Phone: user.phone,
          player2: existingRequest.userName,
          player2Uid: existingRequest.userUid,
          player2Phone: opponent?.phone || '',
          amount: selectedAmount,
          status: 'pending',
          date: new Date().toLocaleString(),
        };
        const updatedGroups = [...groupRequests, newGroupRequest];
        setGroupRequests(updatedGroups);
        saveData('groupRequests', updatedGroups);
        const updatedRequests = matchRequests.map((r: any) =>
          r.id === existingRequest.id ? { ...r, status: 'matched', opponentId: user.id, opponentUid: user.uid, opponentName: user.name, opponentPhone: user.phone } : r
        );
        setMatchRequests(updatedRequests);
        saveData('matchRequests', updatedRequests);
        const updatedUsers = users.map((u: User) => {
          if (u.id === user.id) {
            return { ...u, wallet: u.wallet - selectedAmount, totalMatches: u.totalMatches + 1 };
          }
          if (u.id === existingRequest.userId) {
            return { ...u, totalMatches: u.totalMatches + 1 };
          }
          return u;
        });
        setUsers(updatedUsers);
        saveData('users', updatedUsers);
        setIsSearching(false);
        const adminMessage = encodeURIComponent(
          `📋 طلب إنشاء مجموعة جديدة!\n🔢 اسم المجموعة: ${groupName}\n👤 اللاعب 1: ${user.name} (${user.uid}) - ${user.phone}\n👤 اللاعب 2: ${existingRequest.userName} (${existingRequest.userUid}) - ${opponent?.phone || 'غير مسجل'}\n💰 المبلغ: $${selectedAmount}\n🔗 الرجاء إنشاء المجموعة وإرسال الرابط`
        );
        window.open(`https://wa.me/212604084574?text=${adminMessage}`, '_blank');
        alert(`✅ تم إرسال طلب إنشاء مجموعة ${groupName} للإدمن!`);
      } else {
        const newRequest = {
          id: Date.now(),
          userId: user.id,
          userUid: user.uid,
          userName: user.name,
          userPhone: user.phone,
          amount: selectedAmount,
          status: 'waiting',
          date: new Date().toLocaleString(),
        };
        const updatedRequests = [...matchRequests, newRequest];
        setMatchRequests(updatedRequests);
        saveData('matchRequests', updatedRequests);
        const updatedUser = { ...user, wallet: user.wallet - selectedAmount };
        updateUser(updatedUser);
        setIsSearching(false);
        alert(`⏳ جاري البحث عن خصم...`);
      }
    }, 2000);
  };

  const cancelSearch = () => {
    const request = matchRequests.find(
      (r: any) => r.userId === user.id && r.status === 'waiting'
    );
    if (request) {
      const updatedRequests = matchRequests.filter((r: any) => r.id !== request.id);
      setMatchRequests(updatedRequests);
      saveData('matchRequests', updatedRequests);
      const updatedUser = { ...user, wallet: user.wallet + request.amount };
      updateUser(updatedUser);
    }
    setIsSearching(false);
    alert('❌ تم إلغاء البحث.');
  };

  const requestRecharge = () => {
    if (rechargeAmount < 1) {
      alert('❌ المبلغ يجب أن يكون أكبر من 0');
      return;
    }
    if (!rechargeMessage.trim()) {
      alert('❌ من فضلك اكتب رسالة توضح طلبك');
      return;
    }
    const newRequest = {
      id: Date.now(),
      userId: user.id,
      userUid: user.uid,
      userName: user.name,
      amount: rechargeAmount,
      status: 'pending',
      date: new Date().toLocaleString(),
      message: rechargeMessage,
    };
    const updatedRequests = [...rechargeRequests, newRequest];
    setRechargeRequests(updatedRequests);
    saveData('rechargeRequests', updatedRequests);
    const whatsappMessage = encodeURIComponent(
      `📱 طلب شحن جديد:\n🆔 ID: ${user.uid}\n👤 الاسم: ${user.name}\n📱 الهاتف: ${user.phone}\n💰 المبلغ: $${rechargeAmount}\n📝 الرسالة: ${rechargeMessage}`
    );
    setShowRecharge(false);
    setRechargeAmount(10);
    setRechargeMessage('');
    window.open(`https://wa.me/212604084574?text=${whatsappMessage}`, '_blank');
    alert('✅ تم إرسال طلب الشحن!');
  };

  if (showRecharge) {
    return (
      <div className="min-h-screen bg-dark pb-24">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setShowRecharge(false)} className="text-white/50 text-2xl">←</button>
            <h1 className="text-2xl font-bold text-white">💰 شحن المحفظة</h1>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-white/5">
            <div className="bg-dark/50 rounded-xl p-3 mb-4 text-center">
              <p className="text-yellow-500 text-sm">🆔 رقمك: {user.uid}</p>
            </div>
            <p className="text-white/70 text-sm mb-4">اختر المبلغ الذي تريد شحنه:</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[10, 20, 50, 100, 200, 500].map((amount) => (
                <button key={amount} onClick={() => setRechargeAmount(amount)} className={`py-3 rounded-xl font-semibold transition ${rechargeAmount === amount ? 'bg-primary text-white' : 'bg-dark text-white/50 hover:bg-cardHover'}`}>${amount}</button>
              ))}
            </div>
            <div className="mb-4">
              <label className="block text-white/70 text-sm mb-2">أو أدخل مبلغ مخصص</label>
              <input type="number" value={rechargeAmount} onChange={(e) => setRechargeAmount(Number(e.target.value))} className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary" placeholder="أدخل المبلغ..." min={1} />
            </div>
            <div className="mb-4">
              <label className="block text-white/70 text-sm mb-2">رسالة الطلب</label>
              <textarea value={rechargeMessage} onChange={(e) => setRechargeMessage(e.target.value)} className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary min-h-[80px]" placeholder="مثال: سلام خويا يونس بغيت نشحن 50$" />
            </div>
            <div className="bg-dark/50 rounded-xl p-4 mb-4">
              <p className="text-white/40 text-sm">📌 بعد إرسال الطلب:</p>
              <ul className="text-white/30 text-xs mt-2 space-y-1">
                <li>• سيتم إرسال طلبك إلى الإدمن عبر واتساب</li>
                <li>• ستتواصل معك عبر واتساب لتأكيد الشحن</li>
                <li>• بعد تأكيد الدفع، ستضاف الفلوس لحسابك</li>
              </ul>
            </div>
            <button onClick={requestRecharge} className="w-full bg-gradient-to-r from-primary to-secondary py-3 rounded-xl text-white font-semibold transition hover:scale-[1.02] flex items-center justify-center gap-2">💬 إرسال طلب الشحن عبر واتساب</button>
          </div>
          <NavBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    );
  }

  if (activeTab === 'play') {
    const userRequest = matchRequests.find(
      (r: any) => r.userId === user.id && r.status === 'waiting'
    );
    return (
      <div className="min-h-screen bg-dark pb-24">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-white mb-6">⚽ لعب eFootball</h1>
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-4 mb-6">
            <p className="text-white/70 text-sm">💰 رصيدك الحالي</p>
            <p className="text-white text-3xl font-bold">${user.wallet.toFixed(2)}</p>
          </div>
          {isSearching && (
            <div className="bg-card rounded-2xl p-6 border border-yellow-500/20 mb-6 text-center">
              <p className="text-yellow-500 text-lg font-bold animate-pulse">🔍 جاري البحث عن خصم...</p>
              <p className="text-white/40 text-sm mt-2">المبلغ: ${selectedAmount}</p>
              <div className="flex justify-center gap-1 mt-4">
                <span className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
              <button onClick={cancelSearch} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl transition text-sm">❌ إلغاء</button>
            </div>
          )}
          {userRequest && !isSearching && (
            <div className="bg-card rounded-2xl p-6 border border-yellow-500/20 mb-6 text-center">
              <p className="text-yellow-500 text-lg font-bold">⏳ بانتظار الخصم...</p>
              <p className="text-white/40 text-sm mt-2">المبلغ: ${userRequest.amount}</p>
              <button onClick={cancelSearch} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl transition text-sm">❌ إلغاء</button>
            </div>
          )}
          {!isSearching && !userRequest && (
            <>
              <div className="bg-card rounded-2xl p-6 border border-white/5 mb-6">
                <p className="text-white/70 text-sm mb-4">اختر مبلغ الرهان:</p>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[5, 10, 20, 50].map((amount) => (
                    <button key={amount} onClick={() => setSelectedAmount(amount)} className={`py-3 rounded-xl font-semibold transition ${selectedAmount === amount ? 'bg-primary text-white' : 'bg-dark text-white/50 hover:bg-cardHover'}`}>${amount}</button>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-sm">العمولة: 10%</span>
                  <span className="text-white/40 text-sm">الجائزة: ${(selectedAmount * 1.8).toFixed(2)}</span>
                </div>
              </div>
              <button onClick={findOpponent} disabled={selectedAmount > user.wallet || !user.phone} className={`w-full py-4 rounded-xl text-white font-bold text-lg transition ${selectedAmount > user.wallet || !user.phone ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-secondary hover:scale-[1.02]'}`}>
                {!user.phone ? '📱 أضف رقم هاتفك' : selectedAmount > user.wallet ? '❌ رصيد غير كافي' : `🚀 ابحث عن خصم ($${selectedAmount})`}
              </button>
            </>
          )}
          <NavBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    );
  }

  if (activeTab === 'profile') {
    const [editPhone, setEditPhone] = useState(user.phone || '');
    const [isEditing, setIsEditing] = useState(false);
    const savePhone = () => {
      const updatedUser = { ...user, phone: editPhone };
      updateUser(updatedUser);
      setIsEditing(false);
      alert('✅ تم تحديث رقم الهاتف!');
    };
    return (
      <div className="min-h-screen bg-dark pb-24">
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-card rounded-2xl p-6 border border-white/5">
            <h3 className="text-white font-bold text-lg text-center mb-6">👤 ملفي الشخصي</h3>
            <div className="bg-dark/50 rounded-xl p-3 mb-4 text-center border border-yellow-500/20">
              <p className="text-yellow-500 text-sm font-bold">🆔 {user.uid}</p>
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">{user.name.charAt(0)}</div>
            <p className="text-white font-bold text-center text-xl">{user.name}</p>
            <p className="text-white/40 text-center text-sm">{user.email}</p>
            <div className="bg-dark rounded-xl p-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-white/50">📱 رقم الهاتف</span>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="bg-dark/50 border border-white/10 rounded-lg px-3 py-1 text-white text-sm w-40" placeholder="212600000000" />
                    <button onClick={savePhone} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs">حفظ</button>
                    <button onClick={() => setIsEditing(false)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs">إلغاء</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-white">{user.phone || 'غير مسجل'}</span>
                    <button onClick={() => setIsEditing(true)} className="text-primary hover:text-primary/80 text-sm">تعديل</button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-dark rounded-xl p-4 text-center"><p className="text-white/40 text-xs">💰 المحفظة</p><p className="text-secondary font-bold text-lg">${user.wallet.toFixed(2)}</p></div>
              <div className="bg-dark rounded-xl p-4 text-center"><p className="text-white/40 text-xs">🏆 الأرباح</p><p className="text-yellow-500 font-bold text-lg">${user.totalEarned.toFixed(2)}</p></div>
              <div className="bg-dark rounded-xl p-4 text-center"><p className="text-white/40 text-xs">⚽ المباريات</p><p className="text-white font-bold text-lg">{user.totalMatches}</p></div>
              <div className="bg-dark rounded-xl p-4 text-center"><p className="text-white/40 text-xs">📊 فوز/خسارة</p><p className="text-white font-bold text-lg"><span className="text-green-500">{user.totalWins}</span><span className="text-white/30"> / </span><span className="text-red-500">{user.totalLosses}</span></p></div>
            </div>
            <button onClick={() => setShowRecharge(true)} className="w-full mt-4 bg-gradient-to-r from-primary to-secondary py-3 rounded-xl text-white font-semibold transition hover:scale-[1.02]">💰 شحن المحفظة</button>
            <p className="text-white/20 text-xs text-center mt-4">تاريخ الانضمام: {user.joinDate}</p>
          </div>
          <NavBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pb-24">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-card rounded-2xl p-6 border border-white/5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white">{user.name.charAt(0)}</div>
            <div>
              <h2 className="text-white font-bold text-xl">{user.name}</h2>
              <p className="text-primary text-sm">⚽ لاعب eFootball</p>
              <p className="text-yellow-500 text-xs">🆔 {user.uid}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-4"><p className="text-white/70 text-sm">💰 الرصيد</p><p className="text-white text-2xl font-bold">${user.wallet.toFixed(2)}</p></div>
          <div className="bg-card rounded-2xl p-4 border border-white/5"><p className="text-white/40 text-xs">🏆 المباريات</p><p className="text-white text-2xl font-bold">{user.totalMatches}</p></div>
          <div className="bg-card rounded-2xl p-4 border border-white/5"><p className="text-white/40 text-xs">✅ الفوز</p><p className="text-green-500 text-2xl font-bold">{user.totalWins}</p></div>
          <div className="bg-card rounded-2xl p-4 border border-white/5"><p className="text-white/40 text-xs">❌ الخسارة</p><p className="text-red-500 text-2xl font-bold">{user.totalLosses}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setActiveTab('play')} className="bg-gradient-to-r from-primary to-secondary rounded-xl p-4 text-center transition hover:scale-[1.02]"><p className="text-2xl mb-1">⚽</p><p className="text-white font-bold">ابحث عن خصم</p></button>
          <button onClick={() => setActiveTab('profile')} className="bg-card hover:bg-card/80 border border-white/5 rounded-xl p-4 text-center transition"><p className="text-2xl mb-1">👤</p><p className="text-white font-bold">ملفي</p></button>
        </div>
        <NavBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

// ======================== التطبيق الرئيسي ========================
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      { id: 1, uid: '#ES-0001', name: 'Admin', email: 'admin@esport.com', password: 'admin123', wallet: 0, totalMatches: 0, totalWins: 0, totalLosses: 0, totalEarned: 0, joinDate: new Date().toLocaleDateString(), status: 'active', phone: '212604084574' },
    ];
  });

  const [rechargeRequests, setRechargeRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('rechargeRequests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const [matchRequests, setMatchRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('matchRequests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const [groupRequests, setGroupRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('groupRequests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const refreshUsers = () => {
    const saved = localStorage.getItem('users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUsers(parsed);
        alert(`✅ تم تحديث المستخدمين! (${parsed.length} مستخدم)`);
      } catch (e) {
        alert('❌ خطأ في قراءة البيانات');
      }
    } else {
      alert('❌ لا توجد بيانات محفوظة');
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setIsAdmin(user.email === 'admin@esport.com');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  if (isLoggedIn && isAdmin) {
    return <AdminPanel users={users} setUsers={setUsers} groupRequests={groupRequests} setGroupRequests={setGroupRequests} rechargeRequests={rechargeRequests} setRechargeRequests={setRechargeRequests} matchRequests={matchRequests} onLogout={handleLogout} refreshUsers={refreshUsers} />;
  }

  if (isLoggedIn && currentUser) {
    return <UserHome user={currentUser} onLogout={handleLogout} users={users} setUsers={setUsers} matchRequests={matchRequests} setMatchRequests={setMatchRequests} rechargeRequests={rechargeRequests} setRechargeRequests={setRechargeRequests} groupRequests={groupRequests} setGroupRequests={setGroupRequests} />;
  }

  return <LoginPage onLogin={handleLogin} users={users} setUsers={setUsers} />;
}

export default App;
