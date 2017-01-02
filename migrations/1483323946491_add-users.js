exports.up = function(pgm) {
    pgm.createTable('users', {
        'id': {
            type: 'serial',
            primaryKey: true
        },
        'username': {
            type: 'character varying(64)',
            unique: true
        },
        'password': 'character varying(256)',
        'data': 'jsonb'
    });
};

exports.down = function(pgm) {
    pgm.dropTable('users');
};
