const USER_MENU_KEYBOARD = [
    [{ text: 'Повторить последний заказ' }],
    [{ text: 'Заказать воду' }, { text: 'История заказов' }],
    [{ text: 'О нас' }, { text: 'Контакты' }],
]

module.exports = {
    KEYBOARD_USER_MENU: {
        parse_mode: 'markdown',
        reply_markup: {
            keyboard: USER_MENU_KEYBOARD,
        },
    },
    REMOVE_KEYBOARD: {
        reply_markup: {
            remove_keyboard: true,
        },
    },
    SEND_PHONE_NUMBER: {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: 'Отправить мой номер',
                        request_contact: true,
                    },
                ],
            ],
        },
    }
}
