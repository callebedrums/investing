exports.up = function(pgm) {
    pgm.createTable('users', {
        'id': {
            type: 'serial',
            primaryKey: true
        },
        'username': 'character varying(64)',
        'password': 'character varying(256)',
        'data': 'jsonb'
    });
};

exports.down = function(pgm) {
    pgm.dropTable('users');
};
