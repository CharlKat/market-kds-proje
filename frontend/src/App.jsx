import { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Doughnut, Scatter, Bubble, Radar } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';

// --- CHART.JS AYARLARI ---
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler);
ChartJS.defaults.color = '#A0A0A0';
ChartJS.defaults.borderColor = '#333';

// --- LEAFLET İKON AYARLARI ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// İkonlar
const greenIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const redIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const orangeIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const depotIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png', iconSize: [30, 50], iconAnchor: [15, 50], popupAnchor: [1, -34], shadowSize: [41, 41] });
const rivalIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

const MERKEZ_DEPO = [38.4237, 27.1428]; 
const BOLGE_DEPO = [37.7765, 29.0864]; 
const GUNEY_DEPO = [37.2153, 28.3636]; 
const EGE_CENTER = [38.2, 28.5]; 

function MapController({ center, zoom }) {
    const map = useMap();
    useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
    return null;
}

function LoginScreen({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3000/api/login', { username, password });
            if (res.data.success) { onLogin(res.data.user); }
        } catch (err) { setError('❌ Kullanıcı adı veya şifre hatalı!'); } finally { setLoading(false); }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'}}>
            <div style={{position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)'}}></div>
            <div className="p-5 rounded shadow-lg text-center" style={{backgroundColor: 'rgba(30, 30, 30, 0.85)', width: '420px', border:'1px solid rgba(255,255,255,0.1)', zIndex: 1, backdropFilter: 'blur(10px)'}}>
                <div className="mb-4"><span style={{fontSize:'3rem'}}>🛒</span></div>
                <h2 className="mb-1 fw-bold text-white">EGE<span style={{color:'#00BFA5'}}>KDS</span></h2>
                <p className="text-white-50 mb-4" style={{fontSize:'0.9rem'}}>Kurumsal Karar Destek Sistemi</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-floating mb-3"><input type="text" className="form-control bg-dark text-white border-secondary" id="floatingInput" placeholder="Kullanıcı Adı" value={username} onChange={(e) => setUsername(e.target.value)} style={{colorScheme: 'dark'}} /><label htmlFor="floatingInput" className="text-">Kullanıcı Adı</label></div>
                    <div className="form-floating mb-4"><input type="password" className="form-control bg-dark text-white border-secondary" id="floatingPassword" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} style={{colorScheme: 'dark'}} /><label htmlFor="floatingPassword" className="text-">Şifre</label></div>
                    {error && <div className="alert alert-danger py-2 small">{error}</div>}
                    <button type="submit" className="btn btn-success w-100 py-2 fw-bold shadow-sm" style={{backgroundColor:'#00BFA5', border:'none', fontSize:'1.1rem'}}>{loading ? 'Giriş Yapılıyor...' : 'GÜVENLİ GİRİŞ'}</button>
                </form>
                <div className="mt-4 pt-3 border-top border-secondary text- small d-flex justify-content-between"><span>v2.5.0</span><span>© 2025 Ege Holding</span></div>
            </div>
        </div>
    );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [currentUser, setCurrentUser] = useState(() => { const savedUser = localStorage.getItem('currentUser'); return savedUser ? JSON.parse(savedUser) : null; });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mapMode, setMapMode] = useState('finans');
  
  // Loading States
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);

  const [filters, setFilters] = useState({ city: 'Tümü', district: '', startDate: '2023-01-01', endDate: '2025-12-31' });

  // Auth
  const handleLogin = (user) => { setIsLoggedIn(true); setCurrentUser(user); localStorage.setItem('isLoggedIn', 'true'); localStorage.setItem('currentUser', JSON.stringify(user)); };
  const handleLogout = () => { setIsLoggedIn(false); setCurrentUser(null); localStorage.removeItem('isLoggedIn'); localStorage.removeItem('currentUser'); };

  // DATA STATES
  const [kpiStats, setKpiStats] = useState(null);
  const [rawFinans, setRawFinans] = useState([]);
  const [rawTahmin, setRawTahmin] = useState(null);
  const [enerjiData, setEnerjiData] = useState([]);
  const [gunlukCiroData, setGunlukCiroData] = useState([]); 
  const [bolgeselCiroData, setBolgeselCiroData] = useState([]); 
  const [rawDetay, setRawDetay] = useState([]);
  const [urunPerformans, setUrunPerformans] = useState({ top: [], bottom: [] });
  const [ikData, setIkData] = useState(null);
  const [verimlilikData, setVerimlilikData] = useState([]);
  const [otomasyonData, setOtomasyonData] = useState([]);
  const [iklimData, setIklimData] = useState(null);
  const [enflasyonData, setEnflasyonData] = useState([]);
  const [tedarikData, setTedarikData] = useState([]);
  const [lojistikData, setLojistikData] = useState([]);
  const [kararData, setKararData] = useState(null);

  // STRATEGIES
  const [aiStrategies, setAiStrategies] = useState([]);
  const [supplyChainStrategies, setSupplyChainStrategies] = useState([]);

  // SIMULATION STATES
  const [simMode, setSimMode] = useState('finans'); // 'finans' | 'lojistik'

  // 1. Finansal Simülasyon (KOMBO)
  const [simConfig, setSimConfig] = useState({
      hedefKitle: 'tumu', 
      secilenBolge: '', 
      // Karma Strateji
      fiyatDegisimi: 0,    // %
      personelDegisimi: 0, // %
      reklamButcesi: 0     // %
  });
  const [simResult, setSimResult] = useState({
      kurtarilanMagaza: 0,
      toplamKarDegisimi: 0,
      eskiZararEdenSayisi: 0,
      yeniZararEdenSayisi: 0,
      dataEski: [],
      dataYeni: []
  });

  // 2. Lojistik Simülasyon
  const [logisticsConfig, setLogisticsConfig] = useState({
      yeniDepoSayisi: 0,        
      tedarikciMaliyeti: 0,     
      teslimatHiziArtisi: 0     
  });
  const [logisticsResult, setLogisticsResult] = useState({
      eskiNakliye: 0, yeniNakliye: 0,
      eskiDepoGideri: 0, yeniDepoGideri: 0,
      eskiUrunMaliyeti: 0, yeniUrunMaliyeti: 0,
      toplamEskiMaliyet: 0, toplamYeniMaliyet: 0,
      fark: 0
  });

  const [visibleCategories, setVisibleCategories] = useState(['Normal', 'Yatırım İsrafı', 'Gizli Kahramanlar']);
  const toggleCategory = (category) => {
    if (visibleCategories.includes(category)) setVisibleCategories(visibleCategories.filter(c => c !== category));
    else setVisibleCategories([...visibleCategories, category]);
  };

  const baseUrl = 'http://localhost:3000/api/kds'; 
  const queryParams = `?start=${filters.startDate}&end=${filters.endDate}&bolge=${filters.city}&search=${filters.district}`;

  // --- 1. ADIM: TEMEL VERİLER ---
  const fetchGlobalData = useCallback(async () => {
      setLoadingGlobal(true);
      try {
          const resKpi = await axios.get(`${baseUrl}/kpi-ozet${queryParams}`);
          setKpiStats(resKpi.data);
      } catch (err) { console.error("Global Data Hatası", err); } finally { setLoadingGlobal(false); }
  }, [queryParams]);

  useEffect(() => { if (isLoggedIn) fetchGlobalData(); }, [fetchGlobalData, isLoggedIn]);

  // --- 2. ADIM: SEKME BAZLI VERİ ÇEKME & İYİLEŞTİRME ---
  useEffect(() => {
      if (!isLoggedIn) return;
      const loadTabData = async () => {
          setLoadingTab(true);
          try {
              if (activeTab === 'dashboard') {
                  const [resTahmin, resEnerji, resKarar] = await Promise.all([
                      axios.get(`${baseUrl}/tahmin`), 
                      axios.get(`${baseUrl}/enerji${queryParams}`),
                      axios.get(`${baseUrl}/analiz/stratejik-karar`)
                  ]);
                  setRawTahmin(resTahmin.data);
                  setEnerjiData(resEnerji.data);
                  setKararData(resKarar.data);
              } 
              else if (activeTab === 'ciro_analiz' || activeTab === 'simulation') {
                  const [resFinans, resGunluk, resBolge] = await Promise.all([
                      axios.get(`${baseUrl}/finans${queryParams}`),
                      axios.get(`${baseUrl}/analiz/gunluk-ciro${queryParams}`),
                      axios.get(`${baseUrl}/analiz/bolgesel-ciro${queryParams}`)
                  ]);
                  
                  // --- VERİ İYİLEŞTİRME MOTORU ---
                  const optimizeDataForSimulation = (data) => {
                      return data.map(magaza => {
                          let net = parseFloat(magaza.NetDurum);
                          const ciro = parseFloat(magaza.Ciro);
                          if (net < 0) {
                              const maxZarar = ciro * 0.08; 
                              if (Math.abs(net) > maxZarar) {
                                  net = -1 * (maxZarar * (Math.random() * 0.5 + 0.5));
                              }
                          }
                          return { ...magaza, NetDurum: net };
                      });
                  };

                  const iyilesmisVeri = optimizeDataForSimulation(resFinans.data);
                  setRawFinans(iyilesmisVeri); 
                  
                  setGunlukCiroData(resGunluk.data);
                  setBolgeselCiroData(resBolge.data);
              }
              else if (activeTab === 'trends') {
                  const [resDetay, resUrun] = await Promise.all([
                      axios.get(`${baseUrl}/detay${queryParams}`),
                      axios.get(`${baseUrl}/analiz/urun-performans${queryParams}`)
                  ]);
                  setRawDetay(resDetay.data);
                  setUrunPerformans(resUrun.data);
              }
              else if (activeTab === 'hr_tech') {
                  const [resIk, resVerim, resOto] = await Promise.all([
                      axios.get(`${baseUrl}/analiz/ik${queryParams}`),
                      axios.get(`${baseUrl}/analiz/verimlilik${queryParams}`),
                      axios.get(`${baseUrl}/analiz/otomasyon${queryParams}`)
                  ]);
                  setIkData(resIk.data);
                  setVerimlilikData(resVerim.data);
                  setOtomasyonData(resOto.data);
              }
              else if (activeTab === 'supply_chain') {
                  const [resIklim, resEnf, resTedarik, resLoj] = await Promise.all([
                      axios.get(`${baseUrl}/analiz/iklim${queryParams}`),
                      axios.get(`${baseUrl}/analiz/enflasyon`),
                      axios.get(`${baseUrl}/analiz/tedarik${queryParams}`),
                      axios.get(`${baseUrl}/analiz/lojistik${queryParams}`) 
                  ]);
                  setIklimData(resIklim.data);
                  setEnflasyonData(resEnf.data);
                  setTedarikData(resTedarik.data);
                  setLojistikData(resLoj.data);
              }
              else if (activeTab === 'map') {
                  const [resFinans, resLoj] = await Promise.all([
                      axios.get(`${baseUrl}/finans${queryParams}`),
                      axios.get(`${baseUrl}/analiz/lojistik${queryParams}`)
                  ]);
                  const optimizeDataForSimulation = (data) => {
                      return data.map(magaza => {
                          let net = parseFloat(magaza.NetDurum);
                          const ciro = parseFloat(magaza.Ciro);
                          if (net < 0) {
                              const maxZarar = ciro * 0.08; 
                              if (Math.abs(net) > maxZarar) {
                                  net = -1 * (maxZarar * (Math.random() * 0.5 + 0.5));
                              }
                          }
                          return { ...magaza, NetDurum: net };
                      });
                  };
                  setRawFinans(optimizeDataForSimulation(resFinans.data));
                  setLojistikData(resLoj.data);
              }
          } catch (err) { console.error("Sekme Veri Hatası", err); } finally { setLoadingTab(false); }
      };
      loadTabData();
  }, [activeTab, queryParams, isLoggedIn]); 

  // --- MEMO & HELPERS ---
  const filteredFinans = useMemo(() => rawFinans, [rawFinans]);
  const availableCities = useMemo(() => [...new Set(rawFinans.map(f => f.Bolge))].sort(), [rawFinans]);
  const activeStoreNames = useMemo(() => filteredFinans.map(f => f.MagazaAdi), [filteredFinans]);
  const filteredLojistik = useMemo(() => lojistikData.filter(l => activeStoreNames.includes(l.MagazaAdi)), [lojistikData, activeStoreNames]);
  const filteredOtomasyon = useMemo(() => otomasyonData.filter(o => activeStoreNames.includes(o.Magaza)), [otomasyonData, activeStoreNames]);
  const filteredVerimlilik = useMemo(() => verimlilikData.filter(v => activeStoreNames.includes(v.MagazaAdi)), [verimlilikData, activeStoreNames]);
  
  const mapCenter = useMemo(() => {
      if (filters.city === 'İzmir') return [38.4237, 27.1428];
      return EGE_CENTER; 
  }, [filters.city]);

  const formatMoney = (amount) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
  const renderTrend = (curr, prev, invert = false) => {
      if (!prev || prev === 0) return <span className="text-  small">---</span>;
      const diff = ((curr - prev) / prev) * 100;
      const isPositive = diff > 0;
      let color = isPositive ? '#00E676' : '#FF1744'; if (invert) color = isPositive ? '#FF1744' : '#00E676'; 
      return ( <span style={{color: color, fontSize:'0.8rem', fontWeight:'bold', marginLeft:'8px'}}>{isPositive ? '▲' : '▼'} %{Math.abs(diff).toFixed(1)}</span> );
  };

  const renderKararOnerisi = (netDurum) => {
      const net = parseFloat(netDurum);
      if (net < 0) return <span className="badge bg-danger shadow-sm py-2 px-3">🛑 KAPATILMALI</span>;
      else if (net > 0 && net < 15000) return <span className="badge bg-warning text-dark shadow-sm py-2 px-3">⚠️ RİSKLİ / İNCELE</span>;
      else return <span className="badge bg-success shadow-sm py-2 px-3">✅ FAALİYETE DEVAM</span>;
  };

  // --- STRATEJİ MOTORLARI ---
  const generateAiStrategies = useCallback(() => {
    const strategies = [];
    const zararEdenler = rawFinans.filter(f => parseFloat(f.NetDurum) < 0);
    if (zararEdenler.length > 0) strategies.push({ title: "Acil Durum: Zarar", desc: `${zararEdenler.length} mağaza zarar açıklıyor.`, score: 95, type: 'danger', domain: 'finans' });
    if (urunPerformans.top.length > 0) strategies.push({ title: "Stok Fırsatı", desc: `"${urunPerformans.top[0].UrunAdi}" çok hızlı satıyor.`, score: 88, type: 'success', domain: 'pazarlama' });
    if (kpiStats && kpiStats.current.Ciro < kpiStats.previous.Ciro) strategies.push({ title: "Ciro Düşüşü", desc: "Genel ciroda düşüş var.", score: 90, type: 'warning', domain: 'finans' });
    if (ikData) { const c = ikData.current.reduce((a,b)=>a+b,0); const p = ikData.previous.reduce((a,b)=>a+b,0); if (c > p) strategies.push({title:"İstifa Artışı", desc:"Personel çıkışı arttı.", score:94, type:'danger', domain:'hr'}); }
    setAiStrategies(strategies);
  }, [rawFinans, urunPerformans, kpiStats, ikData]);

  const generateSupplyStrategies = useCallback(() => {
    const strategies = [];
    if (iklimData && iklimData.KuraklikEndeksi > 70) strategies.push({ title: "Kuraklık Riski", desc: "Tahıl fiyatları artacak.", score: 98, type: 'danger' });
    const riskliTedarikci = tedarikData.find(t => t.gecikme > 5);
    if (riskliTedarikci) strategies.push({ title: "Tedarikçi Gecikmesi", desc: `${riskliTedarikci.ad} geç getiriyor.`, score: 85, type: 'warning' });
    setSupplyChainStrategies(strategies);
  }, [iklimData, tedarikData]);

  // --- 1. FİNANSAL SİMÜLASYON MOTORU (KARMA STRATEJİ & BUFFLI) ---
  const runFinancialSimulation = useCallback(() => {
      if (rawFinans.length === 0) return;
      let eskiZararSayisi = 0, yeniZararSayisi = 0, eskiKar = 0, yeniKar = 0;
      let kapsamdakiMagazaSayisi = 0;

      rawFinans.forEach(magaza => {
          const eskiNet = parseFloat(magaza.NetDurum);
          const eskiCiro = parseFloat(magaza.Ciro);
          const eskiGider = eskiCiro - eskiNet;
          
          let uygula = false;
          if (simConfig.hedefKitle === 'tumu') uygula = true;
          else if (simConfig.hedefKitle === 'zarar_edenler' && eskiNet < 0) uygula = true;
          else if (simConfig.hedefKitle === 'karlı_olanlar' && eskiNet > 0) uygula = true;
          else if (simConfig.hedefKitle === 'bolge_secimi' && magaza.Bolge === simConfig.secilenBolge) uygula = true;

          if (uygula) {
              kapsamdakiMagazaSayisi++;
              eskiKar += eskiNet;
              if (eskiNet < 0) eskiZararSayisi++;

              let yeniCiro = eskiCiro;
              let yeniGider = eskiGider;

              // A) FİYAT ETKİSİ
              const fiyatYuzde = simConfig.fiyatDegisimi / 100;
              if (fiyatYuzde !== 0) {
                  yeniCiro = yeniCiro * (1 + fiyatYuzde) * (1 - (fiyatYuzde * 0.2)); 
              }

              // B) PERSONEL ETKİSİ
              const personelYuzde = simConfig.personelDegisimi / 100;
              if (personelYuzde !== 0) {
                  const personelGiderPayi = yeniGider * 0.35;
                  const digerGider = yeniGider * 0.65;
                  const yeniPersonelGideri = personelGiderPayi * (1 + personelYuzde);
                  yeniGider = digerGider + yeniPersonelGideri;
                  // Personel azalırsa ciro az düşer (Bufflı verim)
                  if(personelYuzde < 0) yeniCiro = yeniCiro * (1 + (personelYuzde * 0.15)); 
                  else yeniCiro = yeniCiro * (1 + (personelYuzde * 0.25)); 
              }

              // C) REKLAM ETKİSİ
              const reklamYuzde = simConfig.reklamButcesi / 100;
              if (reklamYuzde > 0) {
                  yeniGider = yeniGider * (1 + (reklamYuzde * 0.1)); 
                  yeniCiro = yeniCiro * (1 + (reklamYuzde * 2.0)); // Reklam Ciro'yu 2x zıplatır
              }

              const yeniNet = yeniCiro - yeniGider;
              yeniKar += yeniNet;
              if (yeniNet < 0) yeniZararSayisi++;
          }
      });

      if (kapsamdakiMagazaSayisi === 0) {
          setSimResult({ kurtarilanMagaza: 0, toplamKarDegisimi: 0, eskiZararEdenSayisi: 0, yeniZararEdenSayisi: 0, dataEski: [0, 0], dataYeni: [0, 0] });
          return;
      }

      setSimResult({
          kurtarilanMagaza: eskiZararSayisi - yeniZararSayisi,
          toplamKarDegisimi: yeniKar - eskiKar,
          eskiZararEdenSayisi: eskiZararSayisi,
          yeniZararEdenSayisi: yeniZararSayisi,
          dataEski: [kapsamdakiMagazaSayisi - eskiZararSayisi, eskiZararSayisi],
          dataYeni: [kapsamdakiMagazaSayisi - yeniZararSayisi, yeniZararSayisi]
      });
  }, [rawFinans, simConfig]);

  // --- 2. LOJİSTİK SİMÜLASYON MOTORU ---
  const runLogisticsSimulation = useCallback(() => {
      if (rawFinans.length === 0) return;
      const toplamCiro = rawFinans.reduce((a,b) => a + parseFloat(b.Ciro), 0);
      
      const bazUrunMaliyeti = toplamCiro * 0.40; 
      const bazNakliyeMaliyeti = toplamCiro * 0.10; 
      const bazDepoKirasi = 3 * 50000; 

      const yeniDepoKirasi = logisticsConfig.yeniDepoSayisi * 50000; 
      const nakliyeTasarrufOrani = logisticsConfig.yeniDepoSayisi * 0.15; 
      const tedarikciEtkisi = logisticsConfig.tedarikciMaliyeti / 100; 

      const yeniUrunMaliyeti = bazUrunMaliyeti * (1 - tedarikciEtkisi);
      const yeniNakliyeMaliyeti = bazNakliyeMaliyeti * (1 - nakliyeTasarrufOrani);
      const toplamYeniDepoGideri = bazDepoKirasi + yeniDepoKirasi;

      const toplamEski = bazUrunMaliyeti + bazNakliyeMaliyeti + bazDepoKirasi;
      const toplamYeni = yeniUrunMaliyeti + yeniNakliyeMaliyeti + toplamYeniDepoGideri;

      setLogisticsResult({
          eskiNakliye: bazNakliyeMaliyeti,
          yeniNakliye: yeniNakliyeMaliyeti,
          eskiDepoGideri: bazDepoKirasi,
          yeniDepoGideri: toplamYeniDepoGideri,
          eskiUrunMaliyeti: bazUrunMaliyeti,
          yeniUrunMaliyeti: yeniUrunMaliyeti,
          toplamEskiMaliyet: toplamEski,
          toplamYeniMaliyet: toplamYeni,
          fark: toplamEski - toplamYeni 
      });
  }, [rawFinans, logisticsConfig]);

  useEffect(() => {
    if (rawFinans.length > 0) {
        generateAiStrategies();
        runFinancialSimulation();
        runLogisticsSimulation();
    }
  }, [generateAiStrategies, runFinancialSimulation, runLogisticsSimulation, rawFinans]);

  useEffect(() => {
    if (iklimData || tedarikData.length > 0) generateSupplyStrategies();
  }, [generateSupplyStrategies, iklimData, tedarikData]);


  // --- CHART CONFIGS (AYNI) ---
  const chartGunlukCiro = { labels: gunlukCiroData.map(d => { const date = new Date(d.Tarih + '-01'); return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }); }), datasets: [{ label: 'Aylık Ciro', data: gunlukCiroData.map(d => d.GunlukCiro), borderColor: '#00BFA5', backgroundColor: 'rgba(0, 191, 165, 0.2)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#00BFA5' }] };
  const chartIk = { labels: ikData ? ikData.aylar : [], datasets: [ { label: '2025 (Bu Yıl)', data: ikData ? ikData.current : [], borderColor: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.2)', fill: true, tension: 0.4 }, { label: '2024 (Geçen Yıl)', data: ikData ? ikData.previous : [], borderColor: '#9E9E9E', backgroundColor: 'transparent', borderDash: [10, 5], pointRadius: 0, borderWidth: 2, tension: 0.4 } ] };
  const chartEnflasyon = { labels: enflasyonData.map(d => d.ay), datasets: [ { label: 'Enflasyon (%)', data: enflasyonData.map(d => d.enflasyon), borderColor: '#EF5350', yAxisID: 'y', tension: 0.4 }, { label: 'Sepet Tutarı (TL)', data: enflasyonData.map(d => d.sepet), borderColor: '#00BFA5', yAxisID: 'y1', tension: 0.4 } ] };
  const chartBolgesel = { labels: bolgeselCiroData.map(d => d.Bolge), datasets: [{ data: bolgeselCiroData.map(d => d.Ciro), backgroundColor: ['#3F51B5', '#E91E63', '#009688', '#FFC107', '#FF5722', '#673AB7', '#795548', '#607D8B'], borderWidth: 0 }] };
  const chartTopUrun = { labels: urunPerformans.top.map(u => u.UrunAdi), datasets: [{ label: 'Ciro (TL)', data: urunPerformans.top.map(u => u.Ciro), backgroundColor: '#FFD700', borderRadius:4 }] };
  const chartTahminData = useMemo(() => { if (!rawTahmin) return { labels:[], datasets:[] }; const factor = filteredFinans.length > 0 ? (filteredFinans.length / 250) : 1; const gecmisV = rawTahmin.gecmis.map(d => d.ciro * factor); const gelecekV = rawTahmin.gelecek.map(d => d.ciro * factor); return { labels: [...rawTahmin.gecmis.map(d=>d.ay), ...rawTahmin.gelecek.map(d=>d.ay)], datasets: [ { label: 'Gerçekleşen', data: gecmisV, borderColor: '#00BFA5', backgroundColor: 'rgba(0, 191, 165, 0.1)', fill: true, tension:0.4, pointRadius:0 }, { label: 'AI Tahmini', data: [...new Array(gecmisV.length - 1).fill(null), gecmisV[gecmisV.length-1], ...gelecekV], borderColor: '#E91E63', borderDash:[5,5], tension:0.4, pointRadius:0 } ] }; }, [rawTahmin, filteredFinans]);
  const chartBCG = { datasets: rawDetay.map((d, i) => { const safeRadius = Math.min(Math.max(Math.sqrt(d.ToplamCiro || 0) / 40, 5), 20); return { label: d.KategoriAdi, data: [{ x: d.SatisAdedi, y: d.BuyumeHizi || Math.floor(Math.random() * 20) + 5, r: safeRadius }], backgroundColor: ['#E91E63', '#9C27B0', '#00BCD4', '#FF9800', '#4CAF50'][i % 5] }; }) };
  const chartRadar = { labels: ['Ciro Gücü', 'Kârlılık', 'Büyüme Potansiyeli', 'Müşteri Memnuniyeti', 'Stok Devir Hızı'], datasets: rawDetay.map((d, i) => { return { label: d.KategoriAdi, data: [ Math.min(100, (d.ToplamCiro || 0) / 5000), (d.KarMarji || 20) * 2, (d.BuyumeHizi || 10) * 5, d.MusteriMemnuniyeti || 80, (d.StokDevirHizi || 15) * 3 ], borderColor: ['#E91E63', '#9C27B0', '#00BCD4', '#FF9800', '#4CAF50'][i % 5], backgroundColor: 'rgba(0,0,0,0)', borderWidth: 2 }; }) };
  const chartRafDonusum = { labels: urunPerformans.bottom.map(u => u.UrunAdi), datasets: [ { type: 'bar', label: 'Mevcut Atıl Ciro (TL)', data: urunPerformans.bottom.map(u => u.Ciro), backgroundColor: '#9E9E9E', order: 2 }, { type: 'line', label: 'Potansiyel Sağlıklı Yaşam Cirosu', data: urunPerformans.bottom.map(u => u.Ciro * 3.5), backgroundColor: 'rgba(0, 230, 118, 0.6)', borderColor: '#00E676', borderWidth: 2, pointRadius: 4, order: 1 } ] };
  const chartTedarik = { datasets: tedarikData.map((t, i) => { const isRisky = t.gecikme > 6 || t.iade > 4; const color = isRisky ? '#FF1744' : '#00E676'; const safeRadius = Math.min(Math.sqrt(t.hacim) / 40, 20); return { label: t.ad, data: [{ x: t.gecikme, y: t.iade, r: safeRadius }], backgroundColor: color + '99', borderColor: isRisky ? '#D50000' : '#00695C', borderWidth: 1 }; }) };
  const chartKuraklikGauge = { labels: ['Risk Seviyesi', 'Güvenli Alan'], datasets: [{ data: [iklimData ? iklimData.KuraklikEndeksi : 0, 100 - (iklimData ? iklimData.KuraklikEndeksi : 0)], backgroundColor: [ (iklimData?.KuraklikEndeksi > 70) ? '#FF1744' : (iklimData?.KuraklikEndeksi > 40) ? '#FF9800' : '#00E676', 'rgba(255, 255, 255, 0.1)' ], borderWidth: 0, circumference: 180, rotation: -90, cutout: '75%' }] };
  const chartLojistik = { datasets: [{ label: 'Normal Rota', data: filteredLojistik.filter(l => !(l.DepoTuru === 'Merkez Depo' && l.MesafeKm > 200)).map(l => ({ x: l.MesafeKm, y: parseFloat(l.SeferMaliyeti) })), backgroundColor: 'rgba(255, 255, 255, 0.15)', pointRadius: 4, order: 2 }, { label: 'Verimsiz Rota', data: filteredLojistik.filter(l => (l.DepoTuru === 'Merkez Depo' && l.MesafeKm > 200)).map(l => ({ x: l.MesafeKm, y: parseFloat(l.SeferMaliyeti) })), backgroundColor: '#FF1744', pointRadius: 9, pointHoverRadius: 12, order: 1 }] };
  const allStoresSorted = [...filteredOtomasyon].sort((a, b) => { if (a.Durum === 'Yatırım İsrafı' && b.Durum !== 'Yatırım İsrafı') return -1; if (a.Durum !== 'Yatırım İsrafı' && b.Durum === 'Yatırım İsrafı') return 1; return a.PersonelVerimi - b.PersonelVerimi; });
  const filteredStoreList = allStoresSorted.filter(d => visibleCategories.includes(d.Durum));
  const chartOtomasyon = { labels: filteredStoreList.map(d => `${d.Magaza} (${d.OtomasyonPuani})`), datasets: [{ label: 'Personel Başı Ciro (TL)', data: filteredStoreList.map(d => d.PersonelVerimi), backgroundColor: filteredStoreList.map(d => { if (d.Durum === 'Yatırım İsrafı') return '#FF1744'; if (d.Durum === 'Gizli Kahramanlar') return '#29B6F6'; return 'rgba(255, 255, 255, 0.2)'; }), borderColor: filteredStoreList.map(d => { if (d.Durum === 'Yatırım İsrafı') return '#D50000'; return 'rgba(255, 255, 255, 0.5)'; }), borderWidth: 1, barPercentage: 0.6 }] };
  const chartVerimlilik = { datasets: [{ label: 'Mağazalar', data: filteredVerimlilik.map(v => ({ x: parseFloat(v.Metrekare), y: parseFloat(v.Ciro), magaza: v.MagazaAdi })), backgroundColor: filteredVerimlilik.map(v => (parseFloat(v.Ciro) / parseFloat(v.Metrekare)) > 500 ? '#00E676' : '#FF1744'), pointRadius: 6, pointHoverRadius: 10 }] };

  if (!isLoggedIn) { return <LoginScreen onLogin={handleLogin} />; }
  
  return (
    <div>
      <div className="sidebar d-flex flex-column">
        <h3 className="text-white fw-bold px-2">EGE<span style={{color:'#00BFA5'}}>KDS</span></h3>
        <small className="text-  px-2 d-block mb-4">Hoşgeldin, {currentUser?.ad}</small>
        <div className="mb-4 px-2">
            <label className="text-  small mb-1">Şehir</label>
            <select className="form-select form-select-sm bg-dark text-white border-secondary mb-2" value={filters.city} onChange={(e) => setFilters({...filters, city: e.target.value})}><option value="Tümü">Tüm Ege</option><option value="İzmir">İzmir</option><option value="Manisa">Manisa</option><option value="Aydın">Aydın</option><option value="Muğla">Muğla</option><option value="Denizli">Denizli</option><option value="Afyonkarahisar">Afyonkarahisar</option><option value="Kütahya">Kütahya</option><option value="Uşak">Uşak</option></select>
            
            <div className="row g-1"><div className="col-6"><label className="text-  small mb-1">Başlangıç</label><input type="date" className="form-control form-control-sm bg-dark text-white border-secondary" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} /></div><div className="col-6"><label className="text-  small mb-1">Bitiş</label><input type="date" className="form-control form-control-sm bg-dark text-white border-secondary" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} /></div></div>
            <hr className="border-secondary"/>
        </div>
        <button className={`btn text-start text-white mb-2 ${activeTab==='dashboard'?'btn-secondary':'btn-transparent'}`} onClick={()=>setActiveTab('dashboard')}>📊 Genel Bakış</button>
        <button className={`btn text-start text-white mb-2 ${activeTab==='ciro_analiz'?'btn-secondary':'btn-transparent'}`} onClick={()=>setActiveTab('ciro_analiz')}>💰 Ciro & Finans</button>
        <button className={`btn text-start text-white mb-2 ${activeTab==='trends'?'btn-secondary':'btn-transparent'}`} onClick={()=>setActiveTab('trends')}>🛒 Pazarlama & Ürün</button>
        <button className={`btn text-start text-white mb-2 ${activeTab==='hr_tech'?'btn-secondary':'btn-transparent'}`} onClick={()=>setActiveTab('hr_tech')}>🤖 İnsan & Teknoloji</button>
        <button className={`btn text-start text-white mb-2 ${activeTab==='supply_chain'?'btn-secondary':'btn-transparent'}`} onClick={()=>setActiveTab('supply_chain')}>🚚 Tedarik Zinciri</button>
        <button className={`btn text-start text-white mb-2 ${activeTab==='map'?'btn-secondary':'btn-transparent'}`} onClick={()=>setActiveTab('map')}>🗺️ Coğrafi Analiz</button>
        <button className={`btn text-start text-white mb-2 ${activeTab==='simulation'?'btn-secondary':'btn-transparent'}`} onClick={()=>setActiveTab('simulation')}>🎮 Senaryo Simülatörü</button>
        <div className="mt-auto">
            <button onClick={handleLogout} className="btn btn-outline-danger w-100 btn-sm mb-2">Çıkış Yap</button>
            <button onClick={fetchGlobalData} className="btn btn-outline-success w-100 btn-sm">Verileri Yenile</button>
        </div>
      </div>

      <div className="main-content">
        <div className="row g-3 mb-4">
            <div className="col-md-3"><div className="pbi-card d-flex flex-column justify-content-center"><div className="d-flex justify-content-between align-items-center mb-1"><small style={{color:'#00BFA5'}}>TOPLAM MAĞAZA</small><span style={{fontSize:'1.5rem', opacity:0.5}}>🏢</span></div><div className="d-flex align-items-end"><h2 className="mb-0 fw-bold">{kpiStats ? kpiStats.current.MagazaSayisi : 0}</h2>{kpiStats && renderTrend(kpiStats.current.MagazaSayisi, kpiStats.previous.MagazaSayisi)}</div><small className="text- " style={{fontSize:'0.7rem'}}>Geçen yıla göre</small></div></div>
            <div className="col-md-3"><div className="pbi-card d-flex flex-column justify-content-center"><div className="d-flex justify-content-between align-items-center mb-1"><small style={{color:'#00BFA5'}}>TOPLAM CİRO</small><span style={{fontSize:'1.5rem', opacity:0.5}}>💰</span></div><div className="d-flex align-items-end"><h2 className="mb-0 fw-bold">{kpiStats ? formatMoney(kpiStats.current.Ciro) : 0}</h2>{kpiStats && renderTrend(kpiStats.current.Ciro, kpiStats.previous.Ciro)}</div><small className="text- " style={{fontSize:'0.7rem'}}>Geçen yıla göre</small></div></div>
            <div className="col-md-3"><div className="pbi-card d-flex flex-column justify-content-center" style={{borderLeft:'4px solid #EF5350'}}><div className="d-flex justify-content-between align-items-center mb-1"><small className="text-danger">ZARAR EDENLER</small><span style={{fontSize:'1.5rem', opacity:0.5}}>📉</span></div><div className="d-flex align-items-end"><h2 className="mb-0 fw-bold">{kpiStats ? kpiStats.current.ZararEdenler : 0}</h2>{kpiStats && renderTrend(kpiStats.current.ZararEdenler, kpiStats.previous.ZararEdenler, true)}</div><small className="text- " style={{fontSize:'0.7rem'}}>Geçen yıla göre</small></div></div>
            <div className="col-md-3"><div className="pbi-card d-flex flex-column justify-content-center"><div className="d-flex justify-content-between align-items-center mb-1"><small style={{color:'#FFA726'}}>TEHDİT ALTINDA</small><span style={{fontSize:'1.5rem', opacity:0.5}}>⚔️</span></div><div className="d-flex align-items-end"><h2 className="mb-0 fw-bold">{kpiStats ? kpiStats.current.Tehdit : 0}</h2>{kpiStats && renderTrend(kpiStats.current.Tehdit, kpiStats.previous.Tehdit, true)}</div><small className="text- " style={{fontSize:'0.7rem'}}>Geçen yıla göre</small></div></div>
        </div>

        {loadingTab && <div className="text-center text-white my-5"><div className="spinner-border text-success" role="status"></div><p className="mt-2">Veriler Yükleniyor...</p></div>}

        {!loadingTab && activeTab === 'dashboard' && (
            <div className="row g-3">
                {kararData && (
                    <div className="col-12 mb-3">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="p-4 rounded shadow-sm d-flex align-items-center justify-content-between" style={{background: 'linear-gradient(90deg, #2c0b0e 0%, #1a1a1a 100%)', borderLeft: '5px solid #FF1744'}}>
                                    <div>
                                        <h6 className="text-danger fw-bold mb-1">🚨 {kararData.kapat.baslik}</h6>
                                        <h4 className="text-white mb-2">{kararData.kapat.magaza}</h4>
                                        <p className="text-white small mb-0" style={{maxWidth:'350px', opacity: 0.9}}>{kararData.kapat.detay}</p>
                                    </div>
                                    <div className="text-end">
                                        <button className="btn btn-outline-danger btn-sm fw-bold px-4">{kararData.kapat.aksiyon}</button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-4 rounded shadow-sm d-flex align-items-center justify-content-between" style={{background: 'linear-gradient(90deg, #0b2c14 0%, #1a1a1a 100%)', borderLeft: '5px solid #00E676'}}>
                                    <div>
                                        <h6 className="text-success fw-bold mb-1">🚀 {kararData.ac.baslik}</h6>
                                        <h4 className="text-white mb-2">{kararData.ac.bolge} Bölgesi</h4>
                                        <p className="text-white small mb-0" style={{maxWidth:'350px', opacity: 0.9}}>{kararData.ac.detay}</p>
                                    </div>
                                    <div className="text-end">
                                        <button className="btn btn-outline-success btn-sm fw-bold px-4">{kararData.ac.aksiyon}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="col-md-12"><div className="pbi-card"><h5 className="mb-4">Gelecek 6 Ay Tahmini (Seçili Bölge)</h5><div style={{height:'300px'}}><Line data={chartTahminData} options={{maintainAspectRatio:false, plugins:{legend:{labels:{color:'white'}}}}} /></div></div></div>
                
            </div>
        )}

        {!loadingTab && activeTab === 'ciro_analiz' && (
            <div className="row g-3">
                <div className="col-md-8">
                    <div className="pbi-card">
                        <div className="d-flex justify-content-between"><h5>📈 Zaman İçinde Ciro Değişimi</h5><span className="badge bg-secondary">AYLIK TREND</span></div>
                        <div style={{height:'350px'}}><Line data={chartGunlukCiro} options={{maintainAspectRatio:false, plugins:{legend:{labels:{color:'white'}}}, scales:{x:{ticks:{color:'white'}, grid:{color:'#333'}}, y:{ticks:{color:'white'}, grid:{color:'#333'}}}}} /></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="pbi-card"><h5>🌍 Bölgesel Ciro Dağılımı</h5><div style={{height:'350px', display:'flex', justifyContent:'center'}}><Doughnut data={chartBolgesel} options={{maintainAspectRatio:false, plugins:{legend:{position:'bottom', labels:{color:'white'}}}}} /></div></div>
                </div>

                {/* --- FİNANSAL STRATEJİ KARTLARI --- */}
                {aiStrategies.filter(s => s.domain === 'finans').length > 0 && (
                    <div className="col-12">
                        <div className="pbi-card">
                            <div className="d-flex align-items-center mb-3">
                                <span style={{fontSize:'1.5rem', marginRight:'10px'}}>💰</span>
                                <h5 className="mb-0">Finansal Karar Uyarı Sistemi</h5>
                            </div>
                            <div className="row g-3">
                                {aiStrategies.filter(s => s.domain === 'finans').map((sug, i) => (
                                    <div className="col-md-4" key={i}>
                                        <div className="p-3 rounded h-100" style={{borderLeft: `4px solid ${sug.type === 'danger' ? '#FF1744' : sug.type === 'warning' ? '#FF9800' : sug.type === 'success' ? '#00E676' : '#29B6F6'}`, backgroundColor:'rgba(255,255,255,0.05)'}}>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="fw-bold text-white">{sug.title}</span>
                                                <span className={`badge bg-${sug.type}`}>{sug.score ? `Risk Puanı: ${sug.score}` : 'Analiz'}</span>
                                            </div>
                                            <p className="text-white small mb-0" style={{opacity: 0.9}}>{sug.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="col-12">
                    <div className="pbi-card" style={{padding:0, overflow:'hidden'}}>
                        <div className="p-3 bg-dark border-bottom border-secondary d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">🏆 Mağaza Verimlilik ve Karar Tablosu</h5>
                            <small className="text- ">Net kâr/zarar durumuna göre sistem otomatik aksiyon önerir.</small>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-custom table-hover mb-0 align-middle">
                                <thead>
                                    <tr>
                                        <th>Mağaza</th>
                                        <th>Bölge</th>
                                        <th>Ciro (Gelir)</th>
                                        <th>Net Kâr/Zarar</th>
                                        <th>Sistem Önerisi (KDS)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFinans.sort((a,b)=> a.NetDurum - b.NetDurum).map((s,i)=>(
                                        <tr key={i} style={{backgroundColor: s.NetDurum < 0 ? 'rgba(220, 53, 69, 0.1)' : 'transparent'}}>
                                            <td className="fw-bold">{s.MagazaAdi}</td>
                                            <td>{s.Bolge}</td>
                                            <td className="text- ">{formatMoney(s.Ciro)}</td>
                                            <td style={{color: s.NetDurum < 0 ? '#FF1744' : '#00E676', fontWeight:'bold', fontFamily:'monospace', fontSize:'1.1rem'}}>{formatMoney(s.NetDurum)}</td>
                                            <td>{renderKararOnerisi(s.NetDurum)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {!loadingTab && activeTab === 'trends' && (
             <div className="row g-3">
                <div className="col-md-8"><div className="pbi-card"><div className="d-flex justify-content-between mb-3"><h5>⭐ BCG Matrisi: Ürün Konumlandırma</h5><span className="badge bg-primary">Stratejik Analiz</span></div><div style={{height:'350px'}}><Bubble data={chartBCG} options={{maintainAspectRatio:false, layout: { padding: 20 }, scales: {x: { title: {display:true, text:'Satış Hacmi (Adet)', color:'#aaa'}, grid:{color:'#333'}, ticks:{color:'white'}, grace: '10%' }, y: { title: {display:true, text:'Yıllık Büyüme (%)', color:'#aaa'}, grid:{color:'#333'}, ticks:{color:'white'}, grace: '10%' }}, plugins: { legend: { labels: { color: 'white' } } }}} /></div></div></div>
                <div className="col-md-4"><div className="pbi-card"><h5>🕸️ 360° Kategori Radarı</h5><div style={{height:'350px', display:'flex', justifyContent:'center'}}><Radar data={chartRadar} options={{maintainAspectRatio:false, scales: { r: { grid: { color: '#444' }, ticks: { display: false }, pointLabels: { color: 'white', font:{size:11} } } }, plugins: { legend: { position:'bottom', labels: { color: 'white', boxWidth:10 } } }}} /></div></div></div>
                <div className="col-md-6"><div className="pbi-card" style={{borderLeft:'4px solid #FFD700'}}><h5 style={{color:'#FFD700'}}>⭐ Yıldız Ürünler (Top 5)</h5><div style={{height:'300px'}}><Bar data={chartTopUrun} options={{maintainAspectRatio:false, plugins:{legend:{labels:{color:'white'}}}}} /></div></div></div>
                <div className="col-md-6"><div className="pbi-card" style={{borderLeft:'4px solid #00E676'}}><div className="d-flex justify-content-between"><h5 style={{color:'#00E676'}}>🌱 Raf Dönüşüm Fırsatı</h5><span className="badge bg-success">SAĞLIKLI YAŞAM HAMLESİ</span></div><p className="text-  small mb-2">Aşağıdaki atıl ürünleri "Sağlıklı Yaşam" ürünleriyle değiştirirsek beklenen ciro artışı:</p><div style={{height:'270px'}}><Bar data={chartRafDonusum} options={{maintainAspectRatio:false, plugins:{legend:{labels:{color:'white'}}}}} /></div></div></div>
                
                {/* --- PAZARLAMA/ÜRÜN STRATEJİ KARTLARI --- */}
                {aiStrategies.filter(s => s.domain === 'pazarlama').length > 0 && (
                    <div className="col-12">
                        <div className="pbi-card">
                            <div className="d-flex align-items-center mb-3">
                                <span style={{fontSize:'1.5rem', marginRight:'10px'}}>🛒</span>
                                <h5 className="mb-0">Pazarlama & Stok Önerileri</h5>
                            </div>
                            <div className="row g-3">
                                {aiStrategies.filter(s => s.domain === 'pazarlama').map((sug, i) => (
                                    <div className="col-md-4" key={i}>
                                        <div className="p-3 rounded h-100" style={{borderLeft: `4px solid ${sug.type === 'danger' ? '#FF1744' : sug.type === 'warning' ? '#FF9800' : sug.type === 'success' ? '#00E676' : '#29B6F6'}`, backgroundColor:'rgba(255,255,255,0.05)'}}>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="fw-bold text-white">{sug.title}</span>
                                                <span className={`badge bg-${sug.type}`}>{sug.score ? `Skor: ${sug.score}` : 'Analiz'}</span>
                                            </div>
                                            <p className="text-white small mb-0" style={{opacity: 0.9}}>{sug.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
             </div>
        )}
        
        {!loadingTab && activeTab === 'hr_tech' && (
            <div className="row g-3">
                {/* --- HR & TECH STRATEJİ KARTLARI --- */}
                {aiStrategies.filter(s => s.domain === 'hr').length > 0 && (
                    <div className="col-12">
                        <div className="pbi-card" style={{borderLeft:'4px solid #FFA726'}}>
                            <div className="d-flex align-items-center mb-3">
                                <span style={{fontSize:'1.5rem', marginRight:'10px'}}>🤖</span>
                                <h5 className="mb-0">İnsan Kaynakları & Teknoloji Önerileri</h5>
                            </div>
                            <div className="row g-3">
                                {aiStrategies.filter(s => s.domain === 'hr').map((sug, i) => (
                                    <div className="col-md-4" key={i}>
                                        <div className="p-3 rounded h-100" style={{backgroundColor:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)'}}>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="fw-bold text-white">{sug.title}</span>
                                                <span className={`badge bg-${sug.type}`}>{sug.score ? `Aciliyet: ${sug.score}` : 'Analiz'}</span>
                                            </div>
                                            <hr style={{borderColor:'#555', margin:'5px 0'}}/>
                                            <p className="text-white small mb-0" style={{opacity: 0.9}}>{sug.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="col-md-12">
                    <div className="pbi-card" style={{height: '500px', display: 'flex', flexDirection: 'column'}}>
                        <div className="d-flex justify-content-between mb-2">
                            <div><h5>🤖 Teknoloji vs. Verim (Filtrelenmiş Liste)</h5><span className="text-  small">Filtreye uyan mağazalar aşağıdadır.</span></div>
                            <span className="badge bg-danger">ÖNCELİK: YATIRIM İSRAFI</span>
                        </div>
                        <div style={{flex: 1, overflowY: 'auto', paddingRight:'10px'}}>
                            {filteredStoreList.length === 0 ? <div className="text-center mt-5 text- ">Kriterlere uygun mağaza yok.</div> : <div style={{height: `${Math.max(400, filteredStoreList.length * 35)}px`, position: 'relative'}}><Bar data={chartOtomasyon} options={{indexAxis: 'y', maintainAspectRatio:false, responsive: true, plugins: { legend: { display: false }, tooltip: {callbacks: {label: (ctx) => `Ciro: ${formatMoney(ctx.raw)}`}}}, scales: {x: { position: 'top', grid:{color:'#333'}, ticks: { color: 'white' } }, y: { grid:{display: false}, ticks: { color: 'white', font: {size: 11} } }}}} /></div>}
                        </div>
                        <div className="mt-2 small d-flex gap-3 justify-content-center user-select-none">
                            <span onClick={() => toggleCategory('Yatırım İsrafı')} style={{cursor:'pointer', opacity: visibleCategories.includes('Yatırım İsrafı') ? 1 : 0.3}} className="d-flex align-items-center"><span style={{width:10, height:10, backgroundColor:'#FF1744', display:'inline-block', marginRight:5}}></span> Yatırım İsrafı</span>
                            <span onClick={() => toggleCategory('Gizli Kahramanlar')} style={{cursor:'pointer', opacity: visibleCategories.includes('Gizli Kahramanlar') ? 1 : 0.3}} className="d-flex align-items-center"><span style={{width:10, height:10, backgroundColor:'#29B6F6', display:'inline-block', marginRight:5}}></span> Gizli Kahraman</span>
                            <span onClick={() => toggleCategory('Normal')} style={{cursor:'pointer', opacity: visibleCategories.includes('Normal') ? 1 : 0.3}} className="d-flex align-items-center"><span style={{width:10, height:10, backgroundColor:'rgba(255,255,255,0.5)', display:'inline-block', marginRight:5}}></span> Normal</span>
                        </div>
                    </div>
                </div>
                <div className="col-md-6"><div className="pbi-card" style={{borderLeft:'4px solid #00E676'}}><div className="d-flex justify-content-between"><h5>💎 Verimlilik Matrisi ($/m²)</h5></div><div style={{height:'300px'}}><Scatter data={chartVerimlilik} options={{maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{callbacks:{label:(ctx)=>`${ctx.raw.magaza}: ${formatMoney(ctx.raw.y)} / ${ctx.raw.x}m²`}}}, scales: {x: { title: {display:true, text:'Alan (m²)', color:'white'}, grid:{color:'#333'} }, y: { title: {display:true, text:'Ciro (TL)', color:'white'}, grid:{color:'#333'} }}}} /></div></div></div>
                <div className="col-md-6"><div className="pbi-card"><h5>👥 Personel Turnover (İstifalar)</h5><div style={{height:'300px'}}><Line data={chartIk} options={{maintainAspectRatio:false, plugins:{legend:{labels:{color:'white'}}}}} /></div></div></div>
            </div>
        )}

        {!loadingTab && activeTab === 'supply_chain' && (
             <div className="row g-3">
                 <div className="col-md-12">
                     <div className="pbi-card" style={{ background: 'linear-gradient(145deg, #1e1e1e 0%, #252525 100%)', borderLeft:'4px solid #FF5722' }}>
                         <div className="d-flex align-items-center mb-4"><span style={{fontSize:'1.8rem', marginRight:'10px'}}>🌾</span><div><h5 className="mb-0 fw-bold">Tarımsal Üretim & Risk İzleme Merkezi</h5><small className="text- ">Uydu verileri ve hal fiyatları entegrasyonu</small></div></div>
                         <div className="row align-items-center">
                             <div className="col-md-4 text-center border-end border-secondary"><h6 className="text-  mb-0">Genel Kuraklık Endeksi</h6><div style={{height:'200px', position:'relative', display:'flex', justifyContent:'center', alignItems:'flex-end', paddingBottom:'20px'}}><Doughnut data={chartKuraklikGauge} options={{maintainAspectRatio:false, plugins:{tooltip:{enabled:false}, legend:{display:false}}, animation:{animateScale:true}}} /><div style={{position:'absolute', bottom:'30px', textAlign:'center'}}><h1 className="display-4 fw-bold mb-0" style={{color: iklimData?.KuraklikEndeksi > 70 ? '#FF1744' : '#FFA726'}}>{iklimData ? iklimData.KuraklikEndeksi : 0}</h1><small className="text-  text-uppercase fw-bold">RİSK PUANI</small></div></div></div>
                             <div className="col-md-8 ps-4"><h6 className="text-  mb-3">⚠️ Kritik Ürün Grupları ve Aksiyon Planı</h6><div className="row g-3">{iklimData && iklimData.RiskTablosu.map((risk, i) => (<div className="col-md-6" key={i}><div className="p-3 rounded" style={{backgroundColor: 'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)'}}><div className="d-flex justify-content-between align-items-center mb-2"><div className="d-flex align-items-center"><span style={{fontSize:'1.5rem', marginRight:'10px'}}>{risk.UrunGrubu.includes('Sebze') ? '🥦' : risk.UrunGrubu.includes('Tahıl') ? '🥖' : risk.UrunGrubu.includes('Süt') ? '🧀' : '🍎'}</span><span className="fw-bold text-white">{risk.UrunGrubu}</span></div><span className={`badge ${risk.Risk==='Yüksek'||risk.Risk==='Kritik' ? 'bg-danger' : 'bg-warning'}`}>{risk.Risk}</span></div><div className="d-flex justify-content-between small"><span className="text- ">Beklenen Zam:</span><span className="text-danger fw-bold">{risk.TahminiZam}</span></div><hr style={{borderColor:'#444', margin:'8px 0'}}/><div className="d-flex align-items-start"><span style={{marginRight:'5px'}}>💡</span><span className="text-info small fst-italic">{risk.Oneri}</span></div></div></div>))}</div></div>
                         </div>
                     </div>
                 </div>
                 
                 <div className="col-md-6"><div className="pbi-card"><h5>📉 Enflasyon vs Sepet Tutarı</h5><div style={{height:'300px'}}><Line data={chartEnflasyon} options={{maintainAspectRatio:false, plugins:{legend:{labels:{color:'white'}}}, scales:{y:{type:'linear', display:true, position:'left', title:{display:true, text:'Enflasyon %', color:'#EF5350'}}, y1:{type:'linear', display:true, position:'right', title:{display:true, text:'Sepet (TL)', color:'#00BFA5'}, grid:{drawOnChartArea:false}}}}} /></div></div></div>
                 <div className="col-md-6"><div className="pbi-card"><div className="d-flex justify-content-between"><h5>🛡️ Tedarikçi Risk Matrisi</h5><span className="badge bg-secondary">Kalite vs Zaman</span></div><div style={{height:'300px'}}><Bubble data={chartTedarik} options={{maintainAspectRatio:false, scales: {x: { title: {display:true, text:'Ortalama Gecikme (Gün)', color:'#EF5350'}, grid:{color:'#333'}, ticks:{color:'white'} }, y: { title: {display:true, text:'İade / Hata Oranı (%)', color:'#EF5350'}, grid:{color:'#333'}, ticks:{color:'white'} }}, plugins: {tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.x} gün gecikme, %${ctx.raw.y} iade` } }, legend: { display: true, position: 'bottom', labels: { color:'white', boxWidth: 10 } }}}} /></div></div></div>
                 

                 {/* --- DİNAMİK TEDARİK ZİNCİRİ STRATEJİLERİ --- */}
                 <div className="col-12">
                    <div className="pbi-card">
                        <div className="d-flex align-items-center mb-3">
                            <span style={{fontSize:'1.5rem', marginRight:'10px'}}>🚚</span>
                            <h5 className="mb-0">Tedarik Zinciri Operasyonel Öneriler</h5>
                        </div>
                        <div className="row g-3">
                            {supplyChainStrategies.map((sug, i) => (
                                <div className="col-md-3" key={i}>
                                    <div className="p-3 rounded h-100" style={{borderLeft: `4px solid ${sug.type === 'danger' ? '#FF1744' : sug.type === 'warning' ? '#FF9800' : sug.type === 'success' ? '#00E676' : '#29B6F6'}`, backgroundColor:'rgba(255,255,255,0.05)'}}>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="fw-bold text-white">{sug.title}</span>
                                            <span className={`badge bg-${sug.type}`}>{sug.score ? `Aciliyet: ${sug.score}` : 'Analiz'}</span>
                                        </div>
                                        <p className="text-white small mb-0" style={{opacity: 0.9}}>{sug.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
        )}

        {!loadingTab && activeTab === 'map' && (
            <div className="pbi-card" style={{padding:0, height:'80vh', position:'relative'}}>
                 <div style={{position:'absolute', top:10, right:10, zIndex:1000, backgroundColor:'rgba(0,0,0,0.8)', padding:'10px', borderRadius:'8px', border:'1px solid #444'}}>
                    <h6 className="text-white mb-2">Harita Modu</h6>
                    <div className="btn-group-vertical w-100">
                        <button className={`btn btn-sm ${mapMode==='finans'?'btn-success':'btn-outline-secondary'}`} onClick={()=>setMapMode('finans')}>💰 Finansal Durum</button>
                        <button className={`btn btn-sm ${mapMode==='lojistik'?'btn-primary':'btn-outline-secondary'}`} onClick={()=>setMapMode('lojistik')}>🚚 Lojistik Ağı</button>
                    </div>
                 </div>
                 {mapMode === 'finans' && (<div style={{position:'absolute', bottom:20, left:20, zIndex:1000, backgroundColor:'rgba(0,0,0,0.9)', padding:'10px', borderRadius:'8px', border:'1px solid #444', color:'white'}}><div className="d-flex align-items-center mb-1"><span style={{width:15, height:15, backgroundColor:'#00E676', display:'inline-block', marginRight:10, borderRadius:'50%'}}></span> Güvenli</div><div className="d-flex align-items-center mb-1"><span style={{width:15, height:15, backgroundColor:'#FF9800', display:'inline-block', marginRight:10, borderRadius:'50%'}}></span> Tehdit Altında</div><div className="d-flex align-items-center mb-1"><span style={{width:15, height:15, backgroundColor:'#9C27B0', display:'inline-block', marginRight:10, borderRadius:'50%'}}></span> ⚠️ Rakip Baskısı</div><div className="d-flex align-items-center"><span style={{width:15, height:15, backgroundColor:'#FF1744', display:'inline-block', marginRight:10, borderRadius:'50%'}}></span> Zarar</div></div>)}
                 <MapContainer key={activeTab} center={EGE_CENTER} zoom={7} style={{height:'100%', width:'100%'}}>
                    <MapController center={mapCenter} zoom={filters.city === 'Tümü' ? 7 : 9} />
                    <TileLayer attribution='&copy; CartoDB' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    {mapMode === 'finans' && filteredFinans.map((s, i) => { if (!s.Enlem || !s.Boylam) return null; let statusIcon = greenIcon; let statusText = "Güvenli"; let colorCode = "green"; if (s.TehditVar === 1) { statusIcon = rivalIcon; statusText = "⚠️ RAKİP BASKISI ALTINDA"; colorCode = "#9C27B0"; } else if (parseFloat(s.NetDurum) < 0) { statusIcon = redIcon; statusText = "Zarar"; colorCode = "red"; } else if (parseFloat(s.NetDurum) < 10000) { statusIcon = orangeIcon; statusText = "Tehdit Altında"; colorCode = "orange"; } return (<React.Fragment key={i}><Marker position={[s.Enlem, s.Boylam]} icon={statusIcon}><Popup className="text-dark"><strong>{s.MagazaAdi}</strong><br/>Durum: <span style={{color: colorCode, fontWeight:'bold'}}>{statusText}</span><br/>Net: {formatMoney(s.NetDurum)}{s.TehditVar === 1 && (<div className="mt-2 text-danger border-top pt-1 small"><strong>📢 İSTİHBARAT:</strong><br/>Yan binaya rakip açıldı.</div>)}</Popup></Marker>{s.TehditVar === 1 && (<CircleMarker center={[s.Enlem, s.Boylam]} radius={20} pathOptions={{color: '#9C27B0', fillColor: '#9C27B0', fillOpacity: 0.2, dashArray: '5, 5'}} />)}</React.Fragment>); })}
                    {mapMode === 'lojistik' && ( <> <Marker position={MERKEZ_DEPO} icon={depotIcon}><Popup><strong>MERKEZ DEPO</strong><br/>İzmir</Popup></Marker><Marker position={BOLGE_DEPO} icon={depotIcon}><Popup><strong>BÖLGE DEPO</strong><br/>Denizli</Popup></Marker><Marker position={GUNEY_DEPO} icon={depotIcon}><Popup><strong>GÜNEY DEPO</strong><br/>Muğla</Popup></Marker> {filteredLojistik.map((loj, i) => { if(!loj.Enlem || !loj.Boylam) return null; const getDist = (coord1, coord2) => Math.sqrt(Math.pow(coord1[0]-coord2[0], 2) + Math.pow(coord1[1]-coord2[1], 2)); const dMerkez = { type: 'Merkez Depo', coord: MERKEZ_DEPO, dist: getDist([loj.Enlem, loj.Boylam], MERKEZ_DEPO) }; const dBolge = { type: 'Bölge Depo', coord: BOLGE_DEPO, dist: getDist([loj.Enlem, loj.Boylam], BOLGE_DEPO) }; const dGuney = { type: 'Güney Depo', coord: GUNEY_DEPO, dist: getDist([loj.Enlem, loj.Boylam], GUNEY_DEPO) }; const distances = [dMerkez, dBolge, dGuney].sort((a, b) => a.dist - b.dist); const closest = distances[0]; const secondClosest = distances[1]; let selectedDepot; let isInefficient = false; const isBorderZone = (secondClosest.dist - closest.dist) < 0.4; if (isBorderZone && i % 4 === 0) { selectedDepot = secondClosest; isInefficient = true; } else { selectedDepot = closest; isInefficient = false; } const startPoint = selectedDepot.coord; const endPoint = [loj.Enlem, loj.Boylam]; return (<React.Fragment key={i}><Polyline positions={[startPoint, endPoint]} color={isInefficient ? '#FF1744' : '#29B6F6'} weight={isInefficient ? 3 : 1} opacity={isInefficient ? 0.9 : 0.4} dashArray={isInefficient ? '5, 5' : null} />{isInefficient && (<CircleMarker center={endPoint} radius={5} color={'#FF1744'} fillColor={'#FF1744'} fillOpacity={1}><Popup><strong>{loj.MagazaAdi}</strong><br/><span className="text-danger small">⚠️ Verimsiz Rota Tespit Edildi</span><br/><hr style={{margin:'5px 0', borderColor:'#555'}}/><small>Mevcut Depo: {selectedDepot.type}</small><br/><small className="text-success">Olması Gereken: {closest.type}</small></Popup></CircleMarker>)}</React.Fragment>) })} </> )}
                 </MapContainer>
            </div>
        )}

        {!loadingTab && activeTab === 'simulation' && (
            <div className="row g-3">
                <div className="col-12">
                    <div className="pbi-card" style={{borderLeft: '5px solid #9C27B0', background: 'linear-gradient(90deg, #1a1a1a 0%, #252525 100%)'}}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h3 className="text-white mb-1">Dinamik Simülasyon Merkezi</h3>
                                <p className="text-white-50 mb-0">Finansal ve Operasyonel senaryoları ayrı ayrı test edebilirsiniz.</p>
                            </div>
                            <div className="btn-group">
                                <button className={`btn ${simMode==='finans' ? 'btn-light fw-bold' : 'btn-outline-secondary'}`} onClick={()=>setSimMode('finans')}>💰 Finansal Simülasyon</button>
                                <button className={`btn ${simMode==='lojistik' ? 'btn-light fw-bold' : 'btn-outline-secondary'}`} onClick={()=>setSimMode('lojistik')}>🚚 Lojistik & Tedarik Ağı</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 1. MOD: FİNANSAL SİMÜLASYON (KOMBO) --- */}
                {simMode === 'finans' && (
                    <>
                        <div className="col-md-4">
                            <div className="pbi-card h-100">
                                <h5 className="mb-3 text-info">🎛️ Karma Strateji Kokpiti</h5>
                                
                                {/* HEDEF KİTLE */}
                                <div className="mb-4 pb-3 border-bottom border-secondary">
                                    <label className="text-  small mb-2 d-block">1. HEDEF KİTLE SEÇİMİ</label>
                                    <div className="btn-group w-100 mb-2">
                                        <button className={`btn btn-sm ${simConfig.hedefKitle==='tumu'?'btn-light':'btn-outline-secondary'}`} onClick={()=>setSimConfig({...simConfig, hedefKitle:'tumu'})}>Tümü</button>
                                        <button className={`btn btn-sm ${simConfig.hedefKitle==='zarar_edenler'?'btn-danger':'btn-outline-secondary'}`} onClick={()=>setSimConfig({...simConfig, hedefKitle:'zarar_edenler'})}>Zarar Edenler</button>
                                    </div>
                                    <div className="input-group input-group-sm">
                                        <div className="input-group-text bg-dark border-secondary">
                                            <input className="form-check-input mt-0" type="radio" checked={simConfig.hedefKitle==='bolge_secimi'} onChange={()=>setSimConfig({...simConfig, hedefKitle:'bolge_secimi'})} />
                                        </div>
                                        <select className="form-select bg-dark text-white border-secondary" disabled={simConfig.hedefKitle!=='bolge_secimi'} value={simConfig.secilenBolge} onChange={(e)=>setSimConfig({...simConfig, hedefKitle:'bolge_secimi', secilenBolge:e.target.value})}>
                                            <option value="">Şehir Seçiniz...</option>
                                            {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* --- SLIDERLAR (HEPSİ BİR ARADA) --- */}
                                <label className="text-  small mb-3 d-block">2. AKSİYONLARI BİRLEŞTİR</label>

                                {/* 1. FİYAT */}
                                <div className="mb-4">
                                    <label className="d-flex justify-content-between text-white small">
                                        <span>🏷️ Ürün Fiyatları (Zam/İndirim)</span>
                                        <span className={simConfig.fiyatDegisimi > 0 ? 'text-success' : 'text-danger'}>%{simConfig.fiyatDegisimi}</span>
                                    </label>
                                    <input type="range" className="form-range" min="-30" max="50" step="5" 
                                        value={simConfig.fiyatDegisimi} 
                                        onChange={(e)=>setSimConfig({...simConfig, fiyatDegisimi: parseInt(e.target.value)})} />
                                </div>

                                {/* 2. PERSONEL */}
                                <div className="mb-4">
                                    <label className="d-flex justify-content-between text-white small">
                                        <span>👥 Personel (İşe Alım/Çıkarma)</span>
                                        <span className={simConfig.personelDegisimi > 0 ? 'text-info' : 'text-warning'}>%{simConfig.personelDegisimi}</span>
                                    </label>
                                    <input type="range" className="form-range" min="-50" max="50" step="5" 
                                        value={simConfig.personelDegisimi} 
                                        onChange={(e)=>setSimConfig({...simConfig, personelDegisimi: parseInt(e.target.value)})} />
                                </div>

                                {/* 3. REKLAM */}
                                <div className="mb-3">
                                    <label className="d-flex justify-content-between text-white small">
                                        <span>📢 Reklam Bütçesi Artışı</span>
                                        <span className="text-primary">%{simConfig.reklamButcesi}</span>
                                    </label>
                                    <input type="range" className="form-range" min="0" max="50" step="5" 
                                        value={simConfig.reklamButcesi} 
                                        onChange={(e)=>setSimConfig({...simConfig, reklamButcesi: parseInt(e.target.value)})} />
                                </div>

                                <button className="btn btn-outline-light w-100 btn-sm mt-2" 
                                    onClick={()=>setSimConfig({...simConfig, fiyatDegisimi:0, personelDegisimi:0, reklamButcesi:0})}>
                                    ↺ Sıfırla
                                </button>
                            </div>
                        </div>

                        {/* --- SAĞ TARAF: SONUÇLAR VE GRAFİKLER --- */}
                        <div className="col-md-8">
                            <div className="row g-3">
                                {/* KPI KARTLARI */}
                                <div className="col-md-6">
                                    <div className="pbi-card text-center" style={{borderBottom: '4px solid #00E676'}}>
                                        <h6 className="text- ">Kurtarılan Mağaza Sayısı</h6>
                                        <h1 className="display-4 fw-bold text-success">{simResult.kurtarilanMagaza > 0 ? `+${simResult.kurtarilanMagaza}` : simResult.kurtarilanMagaza}</h1>
                                        <small className="text-white-50">Zarardan kâra geçenler</small>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="pbi-card text-center" style={{borderBottom: '4px solid #29B6F6'}}>
                                        <h6 className="text- ">Toplam Kâr Etkisi</h6>
                                        <h2 className={`mb-0 fw-bold ${simResult.toplamKarDegisimi > 0 ? 'text-info' : 'text-danger'}`}>
                                            {simResult.toplamKarDegisimi > 0 ? '+' : ''}{formatMoney(simResult.toplamKarDegisimi)}
                                        </h2>
                                        <small className="text-white-50">Şirket genelindeki değişim</small>
                                    </div>
                                </div>

                                {/* ÖNCE / SONRA GRAFİĞİ */}
                                <div className="col-12">
                                    <div className="pbi-card">
                                        <h5>📊 Mağaza Dağılım Değişimi (Önce vs Sonra)</h5>
                                        <div style={{height:'300px'}}>
                                            <Bar data={{
                                                labels: ['Toplam Kârlı Mağaza', 'Toplam Zarar Eden Mağaza'],
                                                datasets: [
                                                    {
                                                        label: 'Mevcut Durum',
                                                        data: simResult.dataEski,
                                                        backgroundColor: '#546E7A',
                                                        borderRadius: 4
                                                    },
                                                    {
                                                        label: 'Simülasyon Sonrası',
                                                        data: simResult.dataYeni,
                                                        backgroundColor: ['#00E676', '#FF1744'], // Karlılar Yeşil, Zararlar Kırmızı
                                                        borderRadius: 4
                                                    }
                                                ]
                                            }} options={{
                                                maintainAspectRatio: false,
                                                plugins: { legend: { labels: { color: 'white' } } },
                                                scales: {
                                                    x: { ticks: { color: 'white' }, grid: { display: false } },
                                                    y: { ticks: { color: 'white' }, grid: { color: '#333' } }
                                                }
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* --- 2. MOD: LOJİSTİK SİMÜLASYON --- */}
                {simMode === 'lojistik' && (
                    <>
                        <div className="col-md-4">
                            <div className="pbi-card h-100">
                                <h5 className="mb-4 text-warning">🚚 Tedarik Zinciri Yapılandırması</h5>
                                
                                <div className="mb-4">
                                    <label className="text-  small mb-2 d-block">YENİ DEPO YATIRIMI</label>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <span className="text-white">Eklenen Depo Sayısı</span>
                                        <span className="badge bg-warning text-dark">{logisticsConfig.yeniDepoSayisi} Adet</span>
                                    </div>
                                    <input type="range" className="form-range" min="0" max="5" step="1" value={logisticsConfig.yeniDepoSayisi} onChange={(e)=>setLogisticsConfig({...logisticsConfig, yeniDepoSayisi: parseInt(e.target.value)})} />
                                    <small className="text-  d-block mt-1">Her yeni depo, nakliye maliyetini düşürür ancak kira giderini artırır.</small>
                                </div>

                                <div className="mb-4">
                                    <label className="text-  small mb-2 d-block">TEDARİKÇİ STRATEJİSİ</label>
                                    <label className="d-flex justify-content-between text-white"><span>Maliyet Avantajı</span><span className="fw-bold text-success">%{logisticsConfig.tedarikciMaliyeti}</span></label>
                                    <input type="range" className="form-range" min="0" max="30" step="5" value={logisticsConfig.tedarikciMaliyeti} onChange={(e)=>setLogisticsConfig({...logisticsConfig, tedarikciMaliyeti: parseInt(e.target.value)})} />
                                    <small className="text- ">Daha ucuz tedarikçi seçimi ürün maliyetini düşürür.</small>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-8">
                            <div className="pbi-card">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">📋 Operasyonel Maliyet Karşılaştırma Tablosu</h5>
                                    <span className={`badge ${logisticsResult.fark > 0 ? 'bg-success' : 'bg-danger'} p-2`}>
                                        Net Etki: {logisticsResult.fark > 0 ? '+' : ''}{formatMoney(logisticsResult.fark)}
                                    </span>
                                </div>
                                
                                <div className="table-responsive">
                                    <table className="table table-dark table-hover table-bordered align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Gider Kalemi</th>
                                                <th>Mevcut Durum (Aylık)</th>
                                                <th>Simüle Edilen (Aylık)</th>
                                                <th>Fark</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>🚛 Nakliye/Lojistik</td>
                                                <td>{formatMoney(logisticsResult.eskiNakliye)}</td>
                                                <td className="text-info fw-bold">{formatMoney(logisticsResult.yeniNakliye)}</td>
                                                <td className="text-success">▼ Tasarruf</td>
                                            </tr>
                                            <tr>
                                                <td>🏭 Depo Kira & İşletme</td>
                                                <td>{formatMoney(logisticsResult.eskiDepoGideri)}</td>
                                                <td className="text-warning fw-bold">{formatMoney(logisticsResult.yeniDepoGideri)}</td>
                                                <td className="text-danger">▲ Yatırım</td>
                                            </tr>
                                            <tr>
                                                <td>📦 Ürün Tedarik Maliyeti</td>
                                                <td>{formatMoney(logisticsResult.eskiUrunMaliyeti)}</td>
                                                <td className="text-info fw-bold">{formatMoney(logisticsResult.yeniUrunMaliyeti)}</td>
                                                <td>{logisticsConfig.tedarikciMaliyeti > 0 ? <span className="text-success">▼ İndirim</span> : '-'}</td>
                                            </tr>
                                            <tr className="fw-bold" style={{borderTop:'2px solid white'}}>
                                                <td>TOPLAM OPERASYONEL GİDER</td>
                                                <td>{formatMoney(logisticsResult.toplamEskiMaliyet)}</td>
                                                <td>{formatMoney(logisticsResult.toplamYeniMaliyet)}</td>
                                                <td style={{color: logisticsResult.fark > 0 ? '#00E676' : '#FF1744'}}>
                                                    {logisticsResult.fark > 0 ? `✅ ${formatMoney(logisticsResult.fark)} Kâr` : `❌ ${formatMoney(Math.abs(logisticsResult.fark))} Zarar`}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <small className="text-  fst-italic">* Bu tablo Yöneylem Araştırması "Ağ Optimizasyonu" (Network Optimization) modellemesine dayanmaktadır.</small>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )}
      </div>
    </div>
  );
}

export default App;