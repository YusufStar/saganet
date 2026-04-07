import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from '../http-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockRes: any;
  let mockReq: any;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = { status: mockStatus };
    mockReq = {
      headers: { 'x-request-id': 'test-req-id' },
      method: 'GET',
      path: '/api/test',
      url: '/api/test?q=1',
    };
    host = {
      switchToHttp: () => ({
        getResponse: () => mockRes,
        getRequest: () => mockReq,
      }),
    } as any;
  });

  it('should return correct status for HttpException', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Not Found',
        requestId: 'test-req-id',
        path: '/api/test?q=1',
      }),
    );
  });

  it('should return 500 for unknown errors', () => {
    const exception = new Error('Something broke');

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });

  it('should return 503 for ECONNREFUSED', () => {
    const exception: any = new Error('connect ECONNREFUSED');
    exception.code = 'ECONNREFUSED';

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(503);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 503,
        message: 'Upstream service unavailable',
      }),
    );
  });
});
