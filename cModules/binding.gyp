{
    "targets": [
        {
            "target_name": "cModule",
            "sources": [ "cModule.cc" ],
            'include_dirs': ["<!(node -p \"require('node-addon-api').include_dir\")"],
        }
    ]
}