module.exports = {
    apps: [
        {
            name: "www",
            script: "bin/www",
            watch: true,
            ignore_watch: ["data"],
            instance_var: "www",
            env: {
                PORT: 3000,
                NODE_ENV: "production",
            },
        },
    ],
};
