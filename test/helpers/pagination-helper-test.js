var sinon           = require('sinon');
var chai            = require('chai');

var expect          = chai.expect;

paginationHelper    = require('../../src/helpers/pagination-helper')();

describe('Pagination helper test suite', function () {

    // 'x-pagination-page',
    // 'x-pagination-page-size',
    // 'x-pagination-total-pages',
    // 'x-pagination-next',
    // 'x-pagination-previous'

    it('should return pagination headers', function () {
        var headers = paginationHelper.getResponseHeaders(1, 2, 5);

        expect(headers['x-pagination-page']).to.equal(1);
        expect(headers['x-pagination-page-size']).to.equal(2);
        expect(headers['x-pagination-total-pages']).to.equal(3);
        expect(headers['x-pagination-next']).to.equal(2);
        expect(headers['x-pagination-previous']).to.equal(0);
    });

    it('sould not includ x-pagination-previous when in first page', function () {
        var headers = paginationHelper.getResponseHeaders(0, 2, 4);

        expect(headers['x-pagination-page']).to.equal(0);
        expect(headers['x-pagination-page-size']).to.equal(2);
        expect(headers['x-pagination-total-pages']).to.equal(2);
        expect(headers['x-pagination-next']).to.equal(1);
        expect(headers['x-pagination-previous']).to.be.undefined; 
    });

    it('sould not includ x-pagination-next when in last page', function () {
        var headers = paginationHelper.getResponseHeaders(2, 2, 5);

        expect(headers['x-pagination-page']).to.equal(2);
        expect(headers['x-pagination-page-size']).to.equal(2);
        expect(headers['x-pagination-total-pages']).to.equal(3);
        expect(headers['x-pagination-next']).to.be.undefined;
        expect(headers['x-pagination-previous']).to.equal(1); 
    });

    it('should x-pagination-previous not be greater than last page', function () {
        var headers = paginationHelper.getResponseHeaders(4, 2, 5);

        expect(headers['x-pagination-page']).to.equal(4);
        expect(headers['x-pagination-page-size']).to.equal(2);
        expect(headers['x-pagination-total-pages']).to.equal(3);
        expect(headers['x-pagination-next']).to.be.undefined;
        expect(headers['x-pagination-previous']).to.equal(2); 
    });

    it('should x-pagination-next not be less than first page', function () {
        var headers = paginationHelper.getResponseHeaders(-4, 2, 5);

        expect(headers['x-pagination-page']).to.equal(-4);
        expect(headers['x-pagination-page-size']).to.equal(2);
        expect(headers['x-pagination-total-pages']).to.equal(3);
        expect(headers['x-pagination-next']).to.equal(0);
        expect(headers['x-pagination-previous']).to.be.undefined; 
    });
});