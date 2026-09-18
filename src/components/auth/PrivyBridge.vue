<template>
  <PrivyBridgeReact />
</template>

<script setup>
import { applyPureReactInVue } from 'veaury';
import PrivyBridgeReactComponent from '@/react_app/PrivyBridge.jsx';

const PrivyBridgeReact = applyPureReactInVue(PrivyBridgeReactComponent);
</script>
