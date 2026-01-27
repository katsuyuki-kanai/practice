/**
 * Controller - API用コントローラー
 * JSON形式でデータを返す
 */

const userModel = require('../models/userModel');

function getUsers(req, res) {
    console.log('  [Controller] apiController.getUsers が呼ばれました');
    
    // Model からデータを取得
    const users = userModel.getAllUsers();
    
    // JSON形式で返却
    const response = {
        success: true,
        timestamp: new Date().toISOString(),
        count: users.length,
        users: users
    };
    
    res.writeHead(200, { 
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(response, null, 2));
}

module.exports = { getUsers };
