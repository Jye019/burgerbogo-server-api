import chai from 'chai';
import chailHttp from 'chai-http';
import app from '../app';

const url = 'ec2-54-180-86-187.ap-northeast-2.compute.amazonaws.com:3000';
const expect = chai.expect;
chai.use(chailHttp);

describe('POST /auth/join', () => {
    /**
     * 1. /auth/join로 POST 요청이 오는 경우
     * 2. 
     */
    it('it should be registered', done => {
        chai.request(url)
            .post('/auth/join')
            .set('content-type', 'application/json; charset=utf-8')
            .send({email:'jihyekim019@gmail.com',
                   password: 'shTmfah1'})
            .end((err, res) => {
                if(err) 
                    done(err);
                expect(res.status).to.equal(200)
             });
    })
});