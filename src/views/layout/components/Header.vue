<template>
    <div class="header">
        <div class="info">
            <div class="nickname">你好，{{ $store.getters.nickname }}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Header',
}
</script>

<style>
.header {
    background: #fff;
    width: 100%;
    padding: 0;
    height: 100%;
    display: flex;
    align-items: center;
}

.info {
    margin-left: auto;
    justify-self: flex-end;
    display: flex;
    align-items: center;
    margin-right: 30px;
}

.avatar {
    margin-right: 30px;
}
</style>
