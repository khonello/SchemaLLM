{
    'endpoint': '/',
    'methods': [
        {
            'get': [
                {
                    'params': ['title'],
                    'response': ['title', 'json', 'conversations']
                }
            ],
            'post': [
                {
                    'params': ['title' | None, 'conversation'],
                    'response': ['status']
                }
            ]
        }
    ],
    # 'endpoint': 'details/',
    # 'methods': [
    #     {
    #         'get': ['titles']
    #     }
    # ],
    # 'endpoint': '/<project:id>',
    # 'methods': [
    #     {
    #         'get': ['title', 'json', 'conversations']
    #     }
    # ]
}
