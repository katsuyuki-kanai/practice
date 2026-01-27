/**
 * Model - データ層
 * データベースアクセスやビジネスロジックを担当
 */

// ダミーデータ（実際はデータベースから取得）
const users = [
    { id: 1, name: '田中太郎', email: 'tanaka@example.com', role: 'エンジニア', department: '開発部' },
    { id: 2, name: '鈴木花子', email: 'suzuki@example.com', role: 'デザイナー', department: 'デザイン部' },
    { id: 3, name: '佐藤次郎', email: 'sato@example.com', role: 'マネージャー', department: '営業部' },
    { id: 4, name: '高橋美咲', email: 'takahashi@example.com', role: 'エンジニア', department: '開発部' },
];

/**
 * 全ユーザーを取得
 */
function getAllUsers() {
    console.log('  [Model] データベースから全ユーザーを取得');
    return users;
}

/**
 * IDでユーザーを検索
 */
function getUserById(id) {
    console.log(`  [Model] ID:${id} のユーザーを検索`);
    return users.find(u => u.id === parseInt(id));
}

/**
 * 部署でユーザーをフィルタリング
 */
function getUsersByDepartment(department) {
    console.log(`  [Model] 部署:${department} でフィルタリング`);
    return users.filter(u => u.department === department);
}

module.exports = {
    getAllUsers,
    getUserById,
    getUsersByDepartment
};
