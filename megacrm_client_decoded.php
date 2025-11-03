<?php

namespace Megagroup\MegaCrm\Api;

use GuzzleHttp;

class Client
{

    const DEFAULT_ENDPOINT = 'https://api.megacrm.ru/v1/';

    /**
     * @var int
     */
    private $account_id;

    /**
     * @var string
     */
    private $api_key;

    /**
     * @var GuzzleHttp\Client
     */
    private $http_client;

    /**
     * @param int               $account_id
     * @param string            $api_key
     * @param GuzzleHttp\Client $http_client
     */
    public function __construct(
        $account_id,
        $api_key,
        GuzzleHttp\Client $http_client = null
    ) {
        $this->account_id = $account_id;
        $this->api_key = $api_key;
        $this->http_client = $http_client ?: self::createHttpClient();
    }

    /**
     * @param RequestInterface $request
     *
     * @return mixed
     */
    public function send(RequestInterface $request)
    {
        $options = [
            'headers' => $this->getHttpRequestHeaders($request),
        ];

        if ($request->getMethod() == 'GET') {
            $options['query'] = $request->jsonSerialize();
        } else {
            $options['json'] = $request->jsonSerialize();
        }

        try {
            $response = $this->http_client->request(
                $request->getMethod(),
                $request->getUrl(),
                $options
            );
        } catch (GuzzleHttp\Exception\GuzzleException $e) {
            if ($e instanceof GuzzleHttp\Exception\RequestException) {
                $response = $e->getResponse();

                if (!$response) {
                    throw new Exception\RequestException(
                        "Cannot make HTTP request: {$e->getMessage()}",
                        0,
                        $e
                    );
                }
            } else {
                throw new Exception\RequestException(
                    'Cannot make HTTP request',
                    0,
                    $e
                );
            }
        }

        if ($response->getStatusCode() != 200) {
            throw new Exception\ResponseException(
                $response->getBody()->getContents(),
                $response->getStatusCode()
            );
        }

        return json_decode($response->getBody()->getContents(), true);
    }

    /**
     * @return GuzzleHttp\Client
     */
    private static function createHttpClient()
    {
        return new GuzzleHttp\Client([
            'base_uri' => self::DEFAULT_ENDPOINT,
            'timeout' => 20.0,
        ]);
    }

    /**
     * @param RequestInterface $request
     *
     * @return array
     */
    private function getHttpRequestHeaders(RequestInterface $request)
    {
        return [
            'X-MegaCrm-ApiSignature' => $this->getSignature($request),
            'X-MegaCrm-AccountId' => $this->account_id,
        ];
    }

    /**
     * @param RequestInterface $request
     *
     * @return string
     */
    private function getSignature(RequestInterface $request)
    {
        return md5(
            $request->getUrl()
            . json_encode($request->jsonSerialize())
            . $this->api_key
        );
    }
}
