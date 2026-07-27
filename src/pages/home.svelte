<script lang="ts">
    import Header from '../lib/components/header.svelte';

    let { message } = $props();
</script>

<svelte:head>
    <title>Inertia Test</title>
</svelte:head>

<main class="p-8">
    <Header/>
    <h1 class="text-2xl font-bold">Welcome to Inertia!</h1>
    <p class="text-gray-600">{message}</p>
</main>