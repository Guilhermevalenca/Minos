<script>
	import {Router, Route, Link} from 'svelte-navigator'
	import Ajuda from './ajuda.svelte'
	import Menu from './menu.svelte'
	import Sobre from './sobre.svelte'
	import Jogar from './jogo.svelte'
</script>
<head>
	<link rel="stylesheet" href="/appsvelte.css">
</head>
<Menu/>
<Router>
	<nav>
		<div class='allbuttonapp'>
			<ul><button class='ulapp'><Link to='/jogo'>Jogar</Link></button></ul>
			<ul><button class='ulapp'><Link to='/sobre'>Sobre</Link></button></ul>
			<ul><button class='ulapp'><Link to='/ajuda'>ajuda</Link></button></ul>
		</div>
	</nav>
	<main>
		<Route path='/jogar'><Jogar/></Route>
		<Route path='/sobre'><Sobre/></Route>
		<Route path='/ajuda'><Ajuda/></Route>
	</main>
</Router>
