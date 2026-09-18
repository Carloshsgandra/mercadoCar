import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { products } from './data/products';
import { api } from './services/api';

const COLORS = { ink: '#18181A', yellow: '#FFB703', muted: '#767680', line: '#EAEAEA', soft: '#F6F6F7', white: '#FFFFFF', danger: '#D64545' };
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const categories = [
  { label: 'Motor', icon: 'engine-outline' }, { label: 'Freios', icon: 'disc' },
  { label: 'Suspensão', icon: 'spring' }, { label: 'Elétrica', icon: 'lightning-bolt-outline' },
];

function IconButton({ icon, onPress, badge, color = COLORS.ink }) {
  return <Pressable onPress={onPress} hitSlop={10} style={styles.iconButton}>
    <Feather name={icon} size={22} color={color} />
    {!!badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
  </Pressable>;
}

function AppLogo() {
  return <View style={styles.logoRow}><View style={styles.logoMark} /><Text style={styles.logoText}>MCCAR</Text></View>;
}

function PrimaryButton({ label, onPress, icon, outline = false, disabled = false, style }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.primaryButton, outline && styles.outlineButton, disabled && styles.disabledButton, style]}>
    {icon && <Feather name={icon} size={18} color={outline ? COLORS.ink : COLORS.white} />}
    <Text style={[styles.primaryButtonText, outline && styles.outlineButtonText]}>{label}</Text>
  </Pressable>;
}

function ProductCard({ product, onPress, compact = false, favorite, onFavorite }) {
  return <Pressable onPress={onPress} style={[styles.productCard, compact && styles.productCardCompact]}>
    <View style={styles.productImageWrap}>
      <Image style={styles.productImage} source={{ uri: product.image }} />
      <Pressable onPress={onFavorite} hitSlop={8} style={styles.favoriteButton}><Feather name="heart" size={16} color={favorite ? COLORS.yellow : COLORS.ink} fill={favorite ? COLORS.yellow : 'transparent'} /></Pressable>
    </View>
    <Text style={styles.brand}>{product.brand}</Text>
    <Text numberOfLines={2} style={styles.productName}>{product.name}</Text>
    <Text style={styles.productPrice}>{BRL.format(product.price)}</Text>
  </Pressable>;
}

function BottomTabs({ active, setScreen, count }) {
  const tabs = [ ['home', 'home', 'Início'], ['catalog', 'grid', 'Peças'], ['cart', 'shopping-cart', 'Carrinho'], ['profile', 'user', 'Perfil'] ];
  return <View style={styles.bottomTabs}>{tabs.map(([key, icon, label]) => {
    const selected = active === key;
    return <Pressable key={key} onPress={() => setScreen(key)} style={styles.tab}>
      <View><Feather name={icon} size={21} color={selected ? COLORS.yellow : '#77777B'} />{key === 'cart' && count > 0 && <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{count}</Text></View>}</View>
      <Text style={[styles.tabLabel, selected && styles.tabSelected]}>{label}</Text>
    </Pressable>;
  })}</View>;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return Alert.alert('E-mail inválido', 'Digite um e-mail válido para continuar.');
    setLoading(true);
    try { await api.login(email, ''); } catch (_) { /* API pode não existir durante a demonstração */ }
    setLoading(false); onLogin();
  };
  return <SafeAreaView style={styles.safe}><View style={styles.loginContainer}>
    <View style={styles.loginBrand}><AppLogo /></View>
    <View style={styles.loginContent}>
      <Text style={styles.loginTitle}>Criar uma conta</Text>
      <Text style={styles.loginSubtitle}>Insira seu e-mail para se cadastrar ou entrar</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="email@dominio.com" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <PrimaryButton label={loading ? 'Entrando...' : 'Continuar'} onPress={submit} disabled={loading} />
      <View style={styles.divider}><View style={styles.dividerLine}/><Text style={styles.dividerText}>ou</Text><View style={styles.dividerLine}/></View>
      <PrimaryButton label="Continuar com o Google" onPress={() => Alert.alert('Integração', 'A autenticação Google será conectada ao back-end.')} outline />
      <PrimaryButton label="Continuar com a Apple" onPress={() => Alert.alert('Integração', 'A autenticação Apple será conectada ao back-end.')} outline />
      <Text style={styles.terms}>Ao clicar em continuar, você concorda com os nossos{`\n`}<Text style={styles.termsStrong}>Termos de Serviço</Text> e com a <Text style={styles.termsStrong}>Política de Privacidade</Text></Text>
    </View>
  </View></SafeAreaView>;
}

function Header({ title, onBack, cartCount, openCart, favorite, onFavorite }) {
  return <View style={styles.header}>
    {onBack ? <IconButton icon="chevron-left" onPress={onBack} /> : <AppLogo />}
    {title && <Text style={styles.headerTitle}>{title}</Text>}
    <View style={styles.headerRight}>
      {onFavorite && <IconButton icon="heart" onPress={onFavorite} color={favorite ? COLORS.yellow : COLORS.ink} />}
      {cartCount !== undefined && <IconButton icon="shopping-cart" badge={cartCount} onPress={openCart} />}
    </View>
  </View>;
}

function Home({ go, cartCount, addToCart, favorites, toggleFavorite, openCart, productList }) {
  return <ScreenShell active="home" go={go} cartCount={cartCount}>
    <Header cartCount={cartCount} openCart={openCart} />
    <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.greeting}>Olá, Carlos 👋</Text>
      <Pressable onPress={() => go('catalog')} style={styles.searchBox}><Feather name="search" size={20} color="#96969B" /><Text style={styles.searchPlaceholder}>Buscar peças, marcas ou códigos</Text></Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {categories.map(category => <Pressable key={category.label} onPress={() => go('catalog', { category: category.label })} style={styles.categoryPill}><MaterialCommunityIcons name={category.icon} size={19} color={COLORS.yellow}/><Text style={styles.categoryText}>{category.label}</Text></Pressable>)}
      </ScrollView>
      <Pressable onPress={() => Alert.alert('Veículo', 'Em breve você poderá cadastrar mais veículos pelo back-end.')} style={styles.vehicleCard}><View style={styles.vehicleIcon}><Feather name="truck" size={21} color={COLORS.yellow}/></View><View style={{flex:1}}><Text style={styles.vehicleTitle}>Adicionar meu veículo</Text><Text style={styles.vehicleSubtitle}>Marca, modelo e ano</Text></View><Feather name="chevron-right" size={21} color={COLORS.muted}/></Pressable>
      <View style={styles.banner}><View><View style={styles.bannerTag}><Text style={styles.bannerTagText}>Garantia MCCAR</Text></View><Text style={styles.bannerTitle}>Peças originais com 12{`\n`}meses de garantia</Text><Text style={styles.bannerSubtitle}>Compatibilidade verificada pelo{`\n`}veículo</Text></View><MaterialCommunityIcons name="disc" size={115} color="#4A4A4E" style={styles.bannerDisc}/></View>
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Destaques</Text><Pressable onPress={() => go('catalog')}><Feather name="chevron-right" size={22}/></Pressable></View>
      <View style={styles.productGrid}>{productList.slice(0, 4).map(product => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} onPress={() => go('detail', { product })} />)}</View>
    </ScrollView>
  </ScreenShell>;
}

function Catalog({ go, cartCount, favorites, toggleFavorite, initialCategory, openCart, productList }) {
  const [query, setQuery] = useState(''); const [category, setCategory] = useState(initialCategory || 'Todos');
  const filtered = useMemo(() => productList.filter(p => (category === 'Todos' || p.category === category) && `${p.name} ${p.brand}`.toLowerCase().includes(query.toLowerCase())), [query, category, productList]);
  return <ScreenShell active="catalog" go={go} cartCount={cartCount}>
    <Header title="Peças" onBack={() => go('home')} cartCount={cartCount} openCart={openCart}/>
    <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <View style={styles.searchBox}><Feather name="search" size={20} color="#96969B"/><TextInput value={query} onChangeText={setQuery} placeholder="Buscar em Peças" style={styles.searchInput}/></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>{['Todos', ...categories.map(x => x.label)].map(item => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.filterPill, category === item && styles.filterPillActive]}><Text style={[styles.filterText, category === item && styles.filterTextActive]}>{item}</Text></Pressable>)}</ScrollView>
      <View style={styles.catalogInfo}><Text style={styles.resultText}>{filtered.length} resultados</Text><Pressable style={styles.sort}><Text style={styles.sortText}>Relevância</Text><Feather name="chevron-down" size={14}/></Pressable></View>
      <View style={styles.compatibility}><Text style={styles.compatibilityText}>Compatível com meu veículo</Text><Switch value trackColor={{false:'#D7D7DA', true:COLORS.yellow}} thumbColor={COLORS.white}/></View>
      <View style={styles.productGrid}>{filtered.map(product => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} onPress={() => go('detail', { product })}/>)}</View>
      {filtered.length === 0 && <Text style={styles.empty}>Nenhuma peça encontrada.</Text>}
    </ScrollView>
  </ScreenShell>;
}

function Detail({ product, go, cartCount, addToCart, favorites, toggleFavorite, openCart }) {
  const [quantity, setQuantity] = useState(1); const isFavorite = favorites.includes(product.id);
  return <ScreenShell active="catalog" go={go} cartCount={cartCount}>
    <Header title="Detalhes" onBack={() => go('catalog')} cartCount={cartCount} openCart={openCart} favorite={isFavorite} onFavorite={() => toggleFavorite(product.id)}/>
    <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
      <View style={styles.detailImageWrap}><Image style={styles.detailImage} source={{uri: product.image}} /></View>
      <View style={styles.dotRow}><View style={styles.activeDot}/><View style={styles.dot}/><View style={styles.dot}/></View>
      <Text style={styles.brand}>{product.brand} · Cód. {product.id.toUpperCase()}</Text>
      <Text style={styles.detailTitle}>{product.name}</Text>
      <Text style={styles.rating}>★ ★ ★ ★ ★  <Text style={styles.ratingMuted}>4,8 (32 avaliações)</Text></Text>
      <View style={styles.detailPriceLine}><Text style={styles.detailPrice}>{BRL.format(product.price)}</Text><Text style={styles.stock}>● Em estoque · envio em 24h</Text></View>
      <InfoRows rows={[['COMPATÍVEL', 'Volkswagen Gol 2013–2019\ne mais 2 veículos'], ['GARANTIA', '12 meses de fábrica'], ['ENTREGA', 'Grátis acima de R$ 299']]}/>
      <Text style={styles.detailSectionTitle}>Descrição</Text><Text style={styles.description}>{product.description}</Text>
      <Text style={styles.detailSectionTitle}>Especificações</Text><InfoRows rows={product.specs.map(([a,b]) => [a.toUpperCase(), b])} compact/>
    </ScrollView>
    <View style={styles.detailFooter}><Quantity value={quantity} setValue={setQuantity}/><PrimaryButton style={styles.detailFooterButton} label="Adicionar ao carrinho" icon="shopping-cart" onPress={() => { addToCart(product, quantity); go('cart'); }}/></View>
  </ScreenShell>;
}

function InfoRows({ rows, compact = false }) { return <View style={styles.infoRows}>{rows.map(([label, value], index) => <View key={label} style={[styles.infoRow, compact && styles.infoRowCompact, index === rows.length - 1 && styles.infoRowLast]}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text>{!compact && <Feather name="chevron-right" size={18} color="#999"/>}</View>)}</View>; }
function Quantity({ value, setValue }) { return <View style={styles.quantity}><Pressable onPress={() => setValue(Math.max(1, value-1))}><Feather name="minus" size={17}/></Pressable><Text style={styles.quantityText}>{value}</Text><Pressable onPress={() => setValue(value+1)}><Feather name="plus" size={17}/></Pressable></View>; }

function Cart({ go, cart, setCart, cartCount, openCart }) {
  const delivery = cart.length ? 24.9 : 0; const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); const total = subtotal + delivery;
  const changeQuantity = (id, next) => setCart(items => items.map(x => x.id === id ? {...x, quantity: Math.max(1,next)} : x));
  const remove = (id) => setCart(items => items.filter(x => x.id !== id));
  return <ScreenShell active="cart" go={go} cartCount={cartCount}><Header title="Carrinho" cartCount={cartCount} openCart={openCart}/>
    <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.cartSubtitle}>{cart.length} {cart.length === 1 ? 'item' : 'itens'}</Text>
      {!cart.length ? <EmptyCart go={go}/> : <><View style={styles.cartList}>{cart.map(item => <View key={item.id} style={styles.cartItem}><Image source={{uri:item.image}} style={styles.cartImage}/><View style={styles.cartDetails}><Text style={styles.brand}>{item.brand}</Text><Text numberOfLines={2} style={styles.cartName}>{item.name}</Text><Quantity value={item.quantity} setValue={(q) => changeQuantity(item.id,q)}/></View><View style={styles.cartPriceSide}><Pressable onPress={() => remove(item.id)}><Feather name="trash-2" size={16} color={COLORS.danger}/></Pressable><Text style={styles.cartPrice}>{BRL.format(item.price * item.quantity)}</Text></View></View>)}</View><Totals subtotal={subtotal} delivery={delivery} total={total}/><PrimaryButton label="Finalizar compra" onPress={() => go('checkout')}/></>}
    </ScrollView>
  </ScreenShell>;
}

function EmptyCart({ go }) { return <View style={styles.emptyCart}><View style={styles.emptyCartIcon}><Feather name="shopping-cart" size={38} color={COLORS.yellow}/></View><Text style={styles.emptyCartTitle}>Seu carrinho está vazio</Text><Text style={styles.emptyCartText}>Encontre as peças ideais para seu veículo.</Text><PrimaryButton label="Ver peças" onPress={() => go('catalog')}/></View>; }
function Totals({ subtotal, delivery, total }) { return <View style={styles.totals}><View style={styles.totalLine}><Text style={styles.totalLabel}>Subtotal</Text><Text>{BRL.format(subtotal)}</Text></View><View style={styles.totalLine}><Text style={styles.totalLabel}>Frete estimado</Text><Text>{BRL.format(delivery)}</Text></View><View style={styles.totalDivider}/><View style={styles.totalLine}><Text style={styles.totalFinal}>Total</Text><Text style={styles.totalFinal}>{BRL.format(total)}</Text></View></View>; }

function Checkout({ go, cart, clearCart, cartCount, openCart }) {
  const [method, setMethod] = useState('Cartão'); const subtotal = cart.reduce((s,x) => s+x.price*x.quantity,0); const delivery = 24.9; const total = subtotal + delivery;
  const pay = async () => { try { await api.createOrder({items:cart,address:'Rua das Oficinas, 120',paymentMethod:method}); } catch (_) {} clearCart(); Alert.alert('Pedido realizado!', 'Seu pedido foi confirmado e você receberá as atualizações pelo aplicativo.', [{text:'Ver início', onPress:()=>go('home')}]); };
  return <ScreenShell active="cart" go={go} cartCount={cartCount}><Header title="Finalizar compra" onBack={() => go('cart')} cartCount={cartCount} openCart={openCart}/>
    <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <CheckoutOption icon="map-pin" title="ENTREGA" value="Rua das Oficinas, 120 · Santo André, SP"/><CheckoutOption icon="truck" title="FRETE" value="R$ 24,90 · Padrão · 3 a 5 dias úteis"/><CheckoutOption icon="credit-card" title="PAGAMENTO" value={method}/>
      <Text style={styles.checkoutSection}>Forma de pagamento</Text><View style={styles.paymentOptions}>{['Cartão', 'Pix', 'Boleto'].map(item => <Pressable onPress={() => setMethod(item)} key={item} style={[styles.paymentOption, method === item && styles.paymentOptionActive]}><Feather name={item === 'Cartão' ? 'credit-card' : item === 'Pix' ? 'zap' : 'file-text'} size={17} color={method === item ? COLORS.ink : COLORS.muted}/><Text style={[styles.paymentText, method === item && styles.paymentTextActive]}>{item}</Text></Pressable>)}</View>
      <Text style={styles.checkoutSection}>Itens</Text><View style={styles.checkoutItems}>{cart.map(item => <View key={item.id} style={styles.checkoutItem}><Image source={{uri:item.image}} style={styles.checkoutThumb}/><View style={{flex:1}}><Text style={styles.brand}>{item.brand}</Text><Text style={styles.checkoutName}>{item.name}</Text><Text style={styles.checkoutQuantity}>Quantidade: {item.quantity}</Text></View><Text style={styles.checkoutPrice}>{BRL.format(item.price*item.quantity)}</Text></View>)}</View>
      <Totals subtotal={subtotal} delivery={delivery} total={total}/>
    </ScrollView><View style={styles.checkoutFooter}><PrimaryButton label={`Fazer pedido · ${BRL.format(total)}`} onPress={pay}/></View>
  </ScreenShell>;
}
function CheckoutOption({ icon, title, value }) { return <View style={styles.checkoutOption}><View style={styles.checkoutIcon}><Feather name={icon} size={18} color={COLORS.yellow}/></View><View style={{flex:1}}><Text style={styles.checkoutOptionTitle}>{title}</Text><Text style={styles.checkoutOptionValue}>{value}</Text></View><Feather name="chevron-right" size={18} color="#A1A1A4"/></View>; }

function Profile({ go, cartCount, openCart }) { return <ScreenShell active="profile" go={go} cartCount={cartCount}><Header title="Meu perfil" cartCount={cartCount} openCart={openCart}/><ScrollView contentContainerStyle={styles.pageContent}><View style={styles.profileHero}><View style={styles.avatar}><Text style={styles.avatarText}>C</Text></View><View><Text style={styles.profileName}>Carlos Andrade</Text><Text style={styles.profileEmail}>carlos@email.com</Text></View><Feather name="edit-3" size={19}/></View><Text style={styles.profileHeading}>Minha garagem</Text><View style={styles.profileVehicle}><MaterialCommunityIcons name="car-outline" size={34} color={COLORS.yellow}/><View><Text style={[styles.vehicleTitle, styles.profileVehicleTitle]}>Volkswagen Gol</Text><Text style={[styles.vehicleSubtitle, styles.profileVehicleSubtitle]}>2013 · 1.6 Flex</Text></View></View><Text style={styles.profileHeading}>Conta</Text>{[['package','Meus pedidos'], ['map-pin','Endereços'], ['heart','Favoritos'], ['help-circle','Ajuda']].map(([icon,title]) => <Pressable key={title} onPress={() => Alert.alert(title, 'Esta área será alimentada pelo back-end do projeto.')} style={styles.profileRow}><Feather name={icon} size={20}/><Text style={styles.profileRowText}>{title}</Text><Feather name="chevron-right" size={19} color={COLORS.muted}/></Pressable>)}</ScrollView></ScreenShell>; }

function ScreenShell({ children, active, go, cartCount }) { return <SafeAreaView style={styles.safe} edges={['top']}><View style={styles.app}>{children}<BottomTabs active={active} setScreen={go} count={cartCount}/></View></SafeAreaView>; }

export default function App() {
  const [logged, setLogged] = useState(false); const [screen, setScreen] = useState('home'); const [params, setParams] = useState({}); const [favorites, setFavorites] = useState([]); const [cart, setCart] = useState([]); const [catalogProducts, setCatalogProducts] = useState(products);
  useEffect(() => {
    api.getProducts().then((remoteProducts) => {
      if (Array.isArray(remoteProducts) && remoteProducts.length) setCatalogProducts(remoteProducts);
    }).catch(() => {});
  }, []);
  const go = (next, nextParams = {}) => { setParams(nextParams); setScreen(next); };
  const addToCart = (product, quantity) => setCart(old => { const item = old.find(x => x.id === product.id); return item ? old.map(x => x.id===product.id ? {...x, quantity:x.quantity+quantity} : x) : [...old, {...product, quantity}]; });
  const toggleFavorite = id => setFavorites(old => old.includes(id) ? old.filter(x => x!==id) : [...old,id]);
  const openCart = () => go('cart'); const count = cart.reduce((sum,x) => sum+x.quantity,0);
  if (!logged) return <SafeAreaProvider><StatusBar barStyle="dark-content"/><Login onLogin={() => {setLogged(true); go('home');}}/></SafeAreaProvider>;
  const common = {go, cartCount:count, openCart};
  const page = screen === 'home' ? <Home {...common} productList={catalogProducts} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite}/> : screen === 'catalog' ? <Catalog {...common} productList={catalogProducts} favorites={favorites} toggleFavorite={toggleFavorite} initialCategory={params.category}/> : screen === 'detail' ? <Detail {...common} product={params.product || catalogProducts[0]} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite}/> : screen === 'cart' ? <Cart {...common} cart={cart} setCart={setCart}/> : screen === 'checkout' ? <Checkout {...common} cart={cart} clearCart={() => setCart([])}/> : <Profile {...common}/>;
  return <SafeAreaProvider><StatusBar barStyle="dark-content" backgroundColor={COLORS.white}/>{page}</SafeAreaProvider>;
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:COLORS.white}, app:{flex:1,backgroundColor:COLORS.white,maxWidth:560,width:'100%',alignSelf:'center'}, loginContainer:{flex:1,backgroundColor:COLORS.white}, loginBrand:{paddingTop:72,alignItems:'center'}, logoRow:{flexDirection:'row',alignItems:'center',gap:9},logoMark:{width:30,height:30,borderRadius:7,backgroundColor:COLORS.ink},logoText:{fontSize:27,fontWeight:'900',letterSpacing:-1,color:COLORS.ink}, loginContent:{paddingHorizontal:28,paddingTop:85,gap:14},loginTitle:{fontSize:24,fontWeight:'800',textAlign:'center',color:COLORS.ink},loginSubtitle:{fontSize:14,color:COLORS.muted,textAlign:'center',marginBottom:11},input:{height:56,backgroundColor:COLORS.soft,borderRadius:14,paddingHorizontal:16,fontSize:16,color:COLORS.ink},primaryButton:{height:54,backgroundColor:COLORS.ink,borderRadius:13,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:9,paddingHorizontal:18},primaryButtonText:{fontSize:16,fontWeight:'700',color:COLORS.white},outlineButton:{backgroundColor:COLORS.soft,borderWidth:1,borderColor:'#EFEFF0'},outlineButtonText:{color:COLORS.ink},disabledButton:{opacity:.55},divider:{flexDirection:'row',alignItems:'center',gap:10,marginVertical:6},dividerLine:{height:1,backgroundColor:COLORS.line,flex:1},dividerText:{fontSize:13,color:'#9A9A9E'},terms:{marginTop:13,textAlign:'center',fontSize:12,color:COLORS.muted,lineHeight:18},termsStrong:{fontWeight:'700',color:COLORS.ink},header:{height:66,flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,borderBottomWidth:1,borderBottomColor:'#F5F5F5'},headerTitle:{position:'absolute',left:66,right:66,textAlign:'center',fontSize:16,fontWeight:'800'},headerRight:{flexDirection:'row',marginLeft:'auto',gap:14},iconButton:{position:'relative',alignItems:'center',justifyContent:'center',width:28,height:32},badge:{position:'absolute',right:-7,top:-2,minWidth:16,height:16,borderRadius:8,backgroundColor:COLORS.yellow,alignItems:'center',justifyContent:'center'},badgeText:{fontSize:10,fontWeight:'800'},pageContent:{padding:20,paddingBottom:108,gap:16},greeting:{fontSize:23,fontWeight:'800',color:COLORS.ink,marginBottom:2},searchBox:{height:52,borderRadius:14,backgroundColor:COLORS.soft,alignItems:'center',paddingHorizontal:15,flexDirection:'row',gap:10},searchPlaceholder:{color:'#9B9B9E',fontSize:15},searchInput:{flex:1,height:'100%',fontSize:15,color:COLORS.ink},categoryScroll:{gap:10,paddingRight:20},categoryPill:{borderWidth:1,borderColor:COLORS.line,borderRadius:22,height:40,paddingHorizontal:14,alignItems:'center',flexDirection:'row',gap:7,backgroundColor:COLORS.white},categoryText:{fontSize:13,fontWeight:'600'},vehicleCard:{borderWidth:1,borderColor:COLORS.line,borderRadius:15,padding:14,flexDirection:'row',alignItems:'center',gap:12},vehicleIcon:{width:36,height:36,borderRadius:18,backgroundColor:'#FFF6D9',alignItems:'center',justifyContent:'center'},vehicleTitle:{fontSize:15,fontWeight:'700'},vehicleSubtitle:{fontSize:13,color:COLORS.muted,marginTop:2},banner:{height:158,overflow:'hidden',backgroundColor:COLORS.ink,borderRadius:16,padding:18,position:'relative'},bannerTag:{alignSelf:'flex-start',backgroundColor:COLORS.yellow,borderRadius:10,paddingHorizontal:9,paddingVertical:3},bannerTagText:{fontSize:11,fontWeight:'800'},bannerTitle:{color:COLORS.white,fontSize:20,fontWeight:'800',lineHeight:24,marginTop:5},bannerSubtitle:{color:'#BABABD',fontSize:12,lineHeight:16,marginTop:5},bannerDisc:{position:'absolute',right:-17,bottom:-12},sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:2},sectionTitle:{fontSize:21,fontWeight:'800'},productGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:18},productCard:{width:'47.5%'},productCardCompact:{width:150},productImageWrap:{height:142,borderRadius:14,backgroundColor:COLORS.soft,overflow:'hidden',position:'relative',marginBottom:8},productImage:{width:'100%',height:'100%',resizeMode:'cover'},favoriteButton:{position:'absolute',right:8,top:8,width:31,height:31,borderRadius:16,backgroundColor:'rgba(255,255,255,.92)',alignItems:'center',justifyContent:'center'},brand:{fontSize:11,color:COLORS.muted,marginBottom:3},productName:{fontSize:14,fontWeight:'700',lineHeight:18,color:COLORS.ink},productPrice:{fontSize:15,fontWeight:'800',marginTop:4},bottomTabs:{height:74,borderTopWidth:1,borderTopColor:COLORS.line,backgroundColor:COLORS.white,flexDirection:'row',justifyContent:'space-around',paddingTop:9,paddingBottom:7},tab:{alignItems:'center',minWidth:57,gap:4},tabLabel:{fontSize:11,color:'#77777B'},tabSelected:{color:COLORS.yellow,fontWeight:'800'},tabBadge:{position:'absolute',right:-10,top:-8,width:16,height:16,borderRadius:8,backgroundColor:COLORS.yellow,alignItems:'center',justifyContent:'center'},tabBadgeText:{fontSize:10,fontWeight:'800'},filterPill:{height:37,justifyContent:'center',paddingHorizontal:16,borderRadius:19,backgroundColor:COLORS.soft},filterPillActive:{backgroundColor:'#FFF2C5'},filterText:{fontSize:13,color:COLORS.muted,fontWeight:'600'},filterTextActive:{color:COLORS.ink,fontWeight:'800'},catalogInfo:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},resultText:{fontSize:13,color:COLORS.muted},sort:{paddingVertical:6,paddingHorizontal:10,borderRadius:9,backgroundColor:COLORS.soft,flexDirection:'row',gap:4,alignItems:'center'},sortText:{fontSize:12,fontWeight:'700'},compatibility:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},compatibilityText:{fontSize:13,fontWeight:'700'},empty:{textAlign:'center',color:COLORS.muted,paddingTop:30},detailContent:{padding:20,paddingBottom:100},detailImageWrap:{height:285,borderRadius:18,overflow:'hidden',backgroundColor:COLORS.soft},detailImage:{height:'100%',width:'100%',resizeMode:'cover'},dotRow:{flexDirection:'row',justifyContent:'center',gap:5,paddingVertical:12},activeDot:{width:7,height:7,borderRadius:4,backgroundColor:COLORS.ink},dot:{width:7,height:7,borderRadius:4,backgroundColor:'#DBDBDE'},detailTitle:{fontSize:23,fontWeight:'800',color:COLORS.ink,marginTop:4},rating:{color:COLORS.yellow,fontSize:12,marginTop:8},ratingMuted:{color:COLORS.muted},detailPriceLine:{marginVertical:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},detailPrice:{fontSize:24,fontWeight:'900'},stock:{fontSize:11,color:'#77777B'},infoRows:{borderWidth:1,borderColor:COLORS.line,borderRadius:13,overflow:'hidden'},infoRow:{minHeight:59,paddingHorizontal:12,flexDirection:'row',alignItems:'center',gap:10,borderBottomWidth:1,borderBottomColor:COLORS.line},infoRowCompact:{minHeight:39},infoRowLast:{borderBottomWidth:0},infoLabel:{fontSize:10,fontWeight:'800',color:COLORS.muted,width:83,letterSpacing:.5},infoValue:{fontSize:12,color:COLORS.ink,flex:1,lineHeight:17},detailSectionTitle:{fontSize:15,fontWeight:'800',marginTop:17,marginBottom:7},description:{fontSize:12,color:COLORS.muted,lineHeight:18},detailFooter:{borderTopWidth:1,borderTopColor:COLORS.line,padding:12,paddingHorizontal:20,flexDirection:'row',gap:10,backgroundColor:COLORS.white},detailFooterButton:{flex:1},quantity:{width:82,height:48,borderWidth:1,borderColor:COLORS.line,borderRadius:11,flexDirection:'row',alignItems:'center',justifyContent:'space-around'},quantityText:{fontSize:14,fontWeight:'700'},cartSubtitle:{fontSize:13,color:COLORS.muted,marginTop:-8},cartList:{gap:12},cartItem:{minHeight:103,flexDirection:'row',gap:11,padding:10,borderRadius:14,backgroundColor:COLORS.soft},cartImage:{width:72,height:72,borderRadius:10},cartDetails:{flex:1},cartName:{fontSize:14,fontWeight:'700',lineHeight:17,marginBottom:7},cartPriceSide:{justifyContent:'space-between',alignItems:'flex-end'},cartPrice:{fontSize:14,fontWeight:'800'},totals:{borderRadius:14,backgroundColor:COLORS.soft,padding:16,gap:11},totalLine:{flexDirection:'row',justifyContent:'space-between'},totalLabel:{fontSize:14,color:COLORS.muted},totalDivider:{height:1,backgroundColor:'#E3E3E5'},totalFinal:{fontSize:16,fontWeight:'900'},emptyCart:{alignItems:'center',gap:12,paddingTop:80},emptyCartIcon:{width:82,height:82,borderRadius:41,backgroundColor:'#FFF6D9',alignItems:'center',justifyContent:'center'},emptyCartTitle:{fontSize:20,fontWeight:'800'},emptyCartText:{fontSize:14,color:COLORS.muted,textAlign:'center',marginBottom:12},checkoutOption:{borderWidth:1,borderColor:COLORS.line,borderRadius:14,padding:13,flexDirection:'row',alignItems:'center',gap:11},checkoutIcon:{width:29,alignItems:'center'},checkoutOptionTitle:{fontSize:10,color:COLORS.muted,fontWeight:'800',letterSpacing:.5},checkoutOptionValue:{fontSize:13,fontWeight:'600',marginTop:3},checkoutSection:{fontSize:16,fontWeight:'800',marginTop:5},paymentOptions:{flexDirection:'row',gap:8},paymentOption:{flex:1,height:47,borderRadius:12,borderWidth:1,borderColor:COLORS.line,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7},paymentOptionActive:{backgroundColor:'#FFF5D5',borderColor:COLORS.yellow},paymentText:{fontSize:13,color:COLORS.muted,fontWeight:'600'},paymentTextActive:{color:COLORS.ink,fontWeight:'800'},checkoutItems:{borderWidth:1,borderColor:COLORS.line,borderRadius:14,padding:10,gap:9},checkoutItem:{flexDirection:'row',gap:10,alignItems:'center'},checkoutThumb:{width:50,height:50,borderRadius:8},checkoutName:{fontSize:13,fontWeight:'700'},checkoutQuantity:{fontSize:11,color:COLORS.muted,marginTop:3},checkoutPrice:{fontSize:13,fontWeight:'800'},checkoutFooter:{borderTopWidth:1,borderTopColor:COLORS.line,padding:14,paddingHorizontal:20,backgroundColor:COLORS.white},profileHero:{flexDirection:'row',alignItems:'center',gap:13,paddingBottom:7},avatar:{width:58,height:58,borderRadius:29,backgroundColor:COLORS.ink,alignItems:'center',justifyContent:'center'},avatarText:{color:COLORS.yellow,fontSize:24,fontWeight:'900'},profileName:{fontSize:17,fontWeight:'800'},profileEmail:{fontSize:13,color:COLORS.muted,marginTop:3},profileHeading:{fontSize:15,fontWeight:'800',marginTop:11},profileVehicle:{flexDirection:'row',gap:13,alignItems:'center',padding:15,backgroundColor:COLORS.ink,borderRadius:15},profileVehicleTitle:{color:COLORS.white},profileVehicleSubtitle:{color:'#C7C7CA'},profileRow:{height:56,flexDirection:'row',alignItems:'center',gap:14,borderBottomWidth:1,borderBottomColor:COLORS.line},profileRowText:{fontSize:15,fontWeight:'600',flex:1}
});
