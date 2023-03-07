import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  extendTheme,
  GridItem,
  Flex,
  Button,
  Heading,
  Container,
  // Contents,
} from "@chakra-ui/react"
import { Card, CardHeader, CardBody, CardFooter, Spinner, Stack } from '@chakra-ui/react'

import { Step, Steps, useSteps } from 'chakra-ui-steps';
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Logo } from "./Logo"
import JSONInput from 'react-json-editor-ajrm';
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';

import ace from 'brace';
import 'brace/mode/json';
import 'brace/theme/github';
import 'brace/theme/xcode';
import 'brace/theme/monokai';
import 'brace/theme/eclipse';

import { useAccountContext, AccountContext, AccountSystem } from './contexts'

import { StepsTheme as StepsTheme } from 'chakra-ui-steps';
import { DID } from "dids";
import { gql, useQuery } from "@apollo/client";
import Axios from 'axios'



const CONTRACT_STATE = gql`
query MyQuery($id: String) {
  contractState(id: $id) {
    state(key: "test-repo")
    state_merkle
  }
}
`
const TRANSACTION_STATUS = gql`
query MyQuery($id: String) {
  findTransaction(id:$id) {
    id
    status
  }
}
`

const theme = extendTheme({
  components: {
    Steps: StepsTheme,
  },
  baseStyle: (props: any) => {
    return {
      ...StepsTheme.baseStyle(props),
      icon: {
        ...StepsTheme.baseStyle(props).icon,
        // your custom styles here
        strokeWidth: "1px",
      },
    };
  },
});


const steps = [{label: 'Create transaction'}, { label: "Transaction created!" }, { label: "Included in block" }, { label: "Confirmed!" }]

export const Vertical = (props: any) => {
  const { nextStep, prevStep, reset, activeStep, setStep } = useSteps({
    initialStep: 0,
  })

  React.useEffect(() => {
    if(props.status === "UNCONFIRMED") {
      setStep(2)
    } else if(props.status === "INCLUDED") {
      setStep(3)
    } else if (props.status === "CONFIRMED") {
      setStep(4)
    }
  }, [props.status])

  return (
    <>
      <Steps orientation="horizontal" activeStep={activeStep}>
        {steps.map(({ label }, index) => (
          <Step width="100%" label={label} key={label}>
            {/* <div>Step {index + 1}</div> */}
            {/* <Contents my={1} index={index} /> */}
          </Step>
        ))}
      </Steps>
      {activeStep === steps.length ? (
        <Flex px={4} py={4} width="100%" flexDirection="column">
          {/* <Heading fontSize="xl" textAlign="center">
            Woohoo! All steps completed!
          </Heading>
          <Button mx="auto" mt={6} size="sm" onClick={reset}>
            Reset
          </Button> */}
        </Flex>
      ) : (
        <Flex width="100%" justify="flex-end">
          {/* <Button
            isDisabled={activeStep === 0}
            mr={4}
            onClick={prevStep}
            size="sm"
            variant="ghost"
          >
            Prev
          </Button>
          <Button size="sm" onClick={nextStep}>
            {activeStep === steps.length - 1 ? "Finish" : "Next"}
          </Button> */}
        </Flex>
      )}
    </>
  )
}

let sync_pid: any;

export const App = () => {
  const {
    triggerLoginWithHive,
    myDid
  } = useAccountContext()
  const ac = React.useContext(AccountContext)

  const [rawTx, setRawTx] = React.useState({ "key": "world", "value": "insert custom value here!" })
  const [signedTx, setSignedTx] = React.useState(null)
  const [publishing, setPublishing] = React.useState(false)
  const [published, setPublished] = React.useState(false)
  const [txId, setTxId] = React.useState<string | null>(null)

  const { loading, error, data, refetch: refetchState } = useQuery(CONTRACT_STATE, {
    variables: { id: 'test' },
  });

  const { data: transactionData, refetch } = useQuery(TRANSACTION_STATUS, {
    variables: { id: txId },
    skip: !txId
  });


  const txStatus = (transactionData || {})?.findTransaction?.status || "PENDING"

  React.useEffect(() => {
    sync_pid = setInterval(() => {
      if(txId) {
        refetch()
      }
      refetchState()
    }, 1000)
    return () => {
      clearInterval(sync_pid)
    }
  }, [txId])

  const createTransaction = React.useCallback(async () => {
    if (myDid) {
      let contractInput = {
        contract_id: 'test',
        action: 'set',
        payload: {
          ...rawTx,
        },
        op: 'call_contract',
        type: 1,
        salt: `${Math.random()}`
      }
      const did = myDid as DID;
      const dagJws = await did.createDagJWS({
        __t: "vsc-tx",
        __v: "0.1",
        lock_block: "null",
        tx: contractInput
      })

      setSignedTx(JSON.parse(JSON.stringify(dagJws)))
    }
  }, [myDid, rawTx])

  const publishTransaction = React.useCallback(async() => {
    setPublishing(true)
    

    const { data } = await Axios.post('http://localhost:1337/api/v1/gateway/submit_transaction', {
      signedTx: signedTx
    })

    console.log(data)
    setTxId(data.id)

    setPublishing(false)
    setPublished(true)
  }, [signedTx])


  return (<ChakraProvider theme={theme}>
    <Box textAlign="center" fontSize="xl">
      <ColorModeSwitcher justifySelf="flex-end" float="right" />

      <Grid minH="100vh" p={3} templateRows='repeat(3, 1fr)'
        templateColumns='repeat(1, 1fr)' style={{ marginLeft: '15%', marginRight: '15%' }}>
        <Grid
          h='200px'
          templateRows='repeat(2, 1fr)'
          templateColumns='repeat(4, 1fr)'
          gap={4}

        >
          <GridItem rowSpan={2} colSpan={2}>
            <Card>
              <CardHeader style={{ paddingBottom: '0px' }}>
                <Text>
                  Transaction Raw
                </Text>
              </CardHeader>
              <CardBody>
                <Editor
                  mode="code"
                  value={{ "key": "world", "value": "insert custom value here!" }}
                  onChange={(value: any) => {
                    console.log(value)
                    setRawTx(value)
                  }}
                  ace={ace}
                  theme="ace/theme/monokai"
                // schema={yourSchema}
                />
              </CardBody>
            </Card>
          </GridItem>
          <GridItem rowSpan={2} colSpan={2}>
            <Card>
              <CardHeader style={{ paddingBottom: '0px' }}>
                <Text>
                  Contract Input
                </Text>
              </CardHeader>
              <CardBody>
                {signedTx ? <Editor
                  key="contract-input"
                  mode="code"
                  value={signedTx}
                  ace={ace}
                  theme="ace/theme/monokai"
                /> : <Editor
                  mode="code"
                  value={{}}
                  ace={ace}
                  theme="ace/theme/monokai"
                />}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
        <Grid
          h='200px'
          templateRows='repeat(2, 1fr)'
          templateColumns='repeat(4, 1fr)'
          gap={4}
        >
          <GridItem colSpan={2}>
            <Card>
              <CardHeader style={{ paddingBottom: '0px' }}>
                <Text>
                  Contract State (current)
                </Text>
              </CardHeader>
              <CardBody>
                {
                  data?.contractState?.state ?
                    <Editor
                      key={JSON.stringify(data?.contractState?.state)}
                      mode="code"
                      value={data?.contractState?.state || {}}
                      // onChange={(value: any) => {
                      //   console.log(value)
                      // }}
                      ace={ace}
                      theme="ace/theme/monokai"
                    // schema={yourSchema}
                    /> : null
                }
                <p style={{ fontSize: "small" }}>StateCID: {data?.contractState?.state_merkle}</p>
              </CardBody>
            </Card>

          </GridItem>
          <GridItem colSpan={2}>
            <Card style={{ height: '100%' }}>
              <CardBody style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly'
              }}>
                {
                  signedTx ?
                    <>
                      {publishing ? <Button isDisabled={true}>
                      <Stack direction='row' spacing={4}>
                        <Text>
                          Publishing
                        </Text>
                        <Spinner/>
                      </Stack>
                      </Button> :

                      (
                        published ? <Button>
                          Published! (waiting for chain confirmation)
                        </Button> : <Button onClick={() => {
                          publishTransaction()
                        }}>
                          Publish Transaction
                        </Button>
                      )}
                      
                    </>
                    :
                    <Button onClick={() => {
                      createTransaction()
                    }}>
                      Create Transaction
                    </Button>
                }


                <Button onClick={() => {
                  triggerLoginWithHive()
                }}>
                  Login
                </Button>
                <Container style={{ background: 'var(--chakra-colors-whiteAlpha-200)', borderRadius: 'var(--chakra-radii-md)' }}>
                  DID: {myDid ? (myDid as any).id : null}
                  <br />

                </Container>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
        <GridItem style={{ marginTop: '5%' }}>
          <Vertical status={txStatus} />
        </GridItem>
      </Grid>
      <AccountSystem />
    </Box>
  </ChakraProvider>)
}
