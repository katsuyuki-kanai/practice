/**
 * Model - 商品データ層
 */

const products = [
    { id: 1, name: 'ノートPC', price: 120000, category: '電子機器', stock: 15 },
    { id: 2, name: 'マウス', price: 2500, category: '周辺機器', stock: 50 },
    { id: 3, name: 'キーボード', price: 8000, category: '周辺機器', stock: 30 },
    { id: 4, name: 'モニター', price: 35000, category: '電子機器', stock: 20 },
    { id: 5, name: 'Webカメラ', price: 5500, category: '周辺機器', stock: 25 },
];

/**
 * 全商品を取得
 */
function getAllProducts() {
    console.log('  [Model] データベースから全商品を取得');
    return products;
}

/**
 * IDで商品を検索
 */
function getProductById(id) {
    console.log(`  [Model] ID:${id} の商品を検索`);
    return products.find(p => p.id === parseInt(id));
}

/**
 * カテゴリで商品をフィルタリング
 */
function getProductsByCategory(category) {
    console.log(`  [Model] カテゴリ:${category} でフィルタリング`);
    return products.filter(p => p.category === category);
}

module.exports = {
    getAllProducts,
    getProductById,
    getProductsByCategory
};
