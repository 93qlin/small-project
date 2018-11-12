// 表单验证工具

// 检测是否有输入  
function checkIsNotNull(content) {
    return (content && content != null)
}

// 检测输入内容  
function checkPhoneNum(phoneNum) {
    if (!checkIsNotNull(phoneNum)) { // 是否为空
        return false
    }
    if (!(/^1[34578]\d{9}$/.test(phoneNum))) { // 是否正确的手机号码
        return false
    }

    return true
}

// 比较两个内容是否相等  
function isContentEqual(content_1, content_2) {
    if (!checkIsNotNull(content_1)) {
        return false
    }

    if (content_1 === content_2) {
        return true
    }

    return false
}

module.exports = {
    checkIsNotNull: checkIsNotNull,
    checkPhoneNum: checkPhoneNum,
    isContentEqual: isContentEqual,
}