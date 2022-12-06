<script>
	import {Router, Route, Link} from 'svelte-navigator'
	import Ajuda from './ajuda.svelte'
	import Menu from './menu.svelte'
	import Sobre from './sobre.svelte'
	import Jogar from './jogo.svelte'
</script>

<Router>
	<nav>
		<div>
			<ul><Link to='/'>Menu</Link></ul>
			<ul><Link to='/jogo'>Jogo</Link></ul>
			<ul><Link to='/sobre'>Sobre</Link></ul>
			<ul><Link to='/ajuda'>ajuda</Link></ul>
		</div>
	</nav>
	<main>
		<Route path='/'><Menu/></Route>
		<Route path='/jogar'><Jogar/></Route>
		<Route path='/sobre'><Sobre/></Route>
		<Route path='/ajuda'><Ajuda/></Route>
	</main>
</Router>