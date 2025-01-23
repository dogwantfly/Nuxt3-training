<script setup>
definePageMeta({
  layout: 'admin',
});
const tempNews = ref({
    title: '',
    description: '',
    image: '',
})
const { $apiClient } = useNuxtApp();
const newsList = ref([]);
const response = await $apiClient.getWithAuth('/api/v1/admin/news/');

if (response.status) {
    newsList.value = response.result;
}
const handleAddNews = async (e) => {
    e.preventDefault();
    try {
        if (!tempNews.value.title || !tempNews.value.description || !tempNews.value.image) {
            alert('請填寫標題、內容、圖片 URL');
            return;
        }
        const response = await $apiClient.post('/api/v1/admin/news/', tempNews.value);
        if (response.status) {
            alert('新增成功');
        } else {
            alert('新增失敗');
        }
    } catch (err) {
        alert(err);
    }

}
</script>

<template>
    <div class="container">
        <div>
            <h1>Admin News</h1>
        </div>
        <form action="" @submit="handleAddNews">
            <input type="text" name="title" placeholder="請填寫標題" v-model="tempNews.title" class="form-control mb-2" required>
            <textarea name="content" placeholder="請填寫內容" v-model="tempNews.description" class="form-control mb-2" required></textarea>
            <input type="text" name="image" placeholder="請填寫圖片 URL" v-model="tempNews.image" class="form-control mb-2">
            <button type="submit" class="btn btn-primary-100">新增</button>
        </form>
        <div class="mt-4">
            <h2>最新消息列表</h2>
            <div class="row">
                <div class="col-md-4" v-for="news in newsList" :key="news.id">
                    <div class="card mb-4">
                        <img class="card-img-top" :src="news.image" alt="news image">
                        <div class="card-body">
                            <h5 class="card-title">{{ news.title }}</h5>
                            <p class="card-text">{{ news.description }}</p>
                        </div>
                        <div class="card-footer">
                            <button type="button" class="btn btn-danger">刪除</button>
                            <button type="button" class="btn btn-primary-100">編輯</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>