import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {RestAngularClient} from '../../rest-angular-client';
import {Body} from './body.decorator';
import {getDecoratorProviders} from '../decorators-utils.spec';
import {BodyParserFactory} from '../../http/body-parser/body-parser-factory';
import {BaseUrl, POST} from '..';


describe('Body Decorator', () => {

  @Injectable()
  @BaseUrl('base_url')
  class TestBodyDecoratorService extends RestAngularClient {

    @POST('examples')
    public createExample(@Body example: any): Observable<any> {
      return null;
    }

    @POST('examples/body')
    public createExampleBody(@Body body: any): Observable<any> {
      return null;
    }
  }

  const providers = getDecoratorProviders(TestBodyDecoratorService);

  it('should make a POST with body', () => {
    const mockResponse = 'response';

    providers.testDecoratorService.createExample('example').subscribe(
      res => {
        expect(res).toBe(mockResponse);
      },
      err => fail(`expected a response, but got error: ${err}`)
    );

    const mockRequest = providers.httpMock.expectOne('base_url/examples');
    expect(mockRequest.request.method).toBe('POST');
    expect(mockRequest.request.body).toBe('example');
    mockRequest.flush(mockResponse);
  });

  it('should not throw error', () => {
    const mockResponse = 'response';

    providers.testDecoratorService.createExampleBody({msg: 'body message'}).subscribe(
      res => {
        expect(res).toBe(mockResponse);
      },
      err => fail(`expected a response, but got error: ${err}`)
    );

    const mockRequest = providers.httpMock.expectOne('base_url/examples/body');
    expect(mockRequest.request.method).toBe('POST');
    expect(mockRequest.request.body.msg).toBe('body message');
    mockRequest.flush(mockResponse);
  });

  it('should throw error when using multiple body parameters', () => {
    expect(() => {
      class TestBodyMultiError extends RestAngularClient {

        @POST('examples/body/multi')
        public createExampleBodyMulti(@Body body: any, @Body body2: any): Observable<any> {
          return null;
        }
      }
    }).toThrowError(`Only one '@Body()' decorator for each method is supported`);
  });
});

describe('@Body Decorator - Parser Injection', () => {
  @Injectable()
  class CustomBodyParserFactory implements BodyParserFactory {
    makeParser(bodyParamIndex) {
      return {
        getBodyFromArgs(args: any[]): any {
          return { body1: args[bodyParamIndex], body2: args[bodyParamIndex + 1] };
        }
      };
    }
  }

  @Injectable()
  @BaseUrl('base_url')
  class TestBodyDecoratorService extends RestAngularClient {

    @POST('examples')
    public createExample(@Body body1: any, body2: any): Observable<any> {
      return null;
    }
  }

  const providers = getDecoratorProviders(TestBodyDecoratorService, [
    { provide: BodyParserFactory, useClass: CustomBodyParserFactory }
  ]);

  it('should use custom parser factory', () => {
    const mockResponse = 'response';

    providers.testDecoratorService.createExample('example1', 'example2').subscribe(
      res => {
        expect(res).toBe(mockResponse);
      },
      err => fail(`expected a response, but got error: ${err}`)
    );

    const mockRequest = providers.httpMock.expectOne('base_url/examples');
    expect(mockRequest.request.method).toBe('POST');
    expect(mockRequest.request.body).toEqual({
      body1: 'example1',
      body2: 'example2'
    });
    mockRequest.flush(mockResponse);
  });
});
