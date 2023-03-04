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


const steps = [{ label: "Step 1" }, { label: "Step 2" }, { label: "Step 3" }]

export const Vertical = () => {
  const { nextStep, prevStep, reset, activeStep } = useSteps({
    initialStep: 0,
  })
  return (
    <>
      <Steps orientation="horizontal" activeStep={activeStep}>
        {steps.map(({ label }, index) => (
          <Step width="100%" label={label} key={label}>
            <div>Step {index + 1}</div>
            {/* <Contents my={1} index={index} /> */}
          </Step>
        ))}
      </Steps>
      {activeStep === steps.length ? (
        <Flex px={4} py={4} width="100%" flexDirection="column">
          <Heading fontSize="xl" textAlign="center">
            Woohoo! All steps completed!
          </Heading>
          <Button mx="auto" mt={6} size="sm" onClick={reset}>
            Reset
          </Button>
        </Flex>
      ) : (
        <Flex width="100%" justify="flex-end">
          <Button
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
          </Button>
        </Flex>
      )}
    </>
  )
}

export const App = () => {
  const {
    triggerLoginWithHive,
    myDid
  } = useAccountContext()
  const ac = React.useContext(AccountContext)
  console.log(ac)

  const { loading, error, data } = useQuery(CONTRACT_STATE, {
    variables: { id: 'test' },
  });

  const [signedTx, setSignedTx] = React.useState(null)
  const [publishing, setPublishing] = React.useState(false)
  const [published, setPublished] = React.useState(false)

  const createTransaction = React.useCallback(async () => {
    if (myDid) {
      let contractInput = {
        contract_id: 'test',
        action: 'call_contract',
        payload: {

        },
        op: 'call_contract',
        type: 1,
        salt: `${Math.random()}`
      }
      const did = myDid as DID;
      const dagJws = await did.createDagJWS({
        contractInput
      })

      setSignedTx(JSON.parse(JSON.stringify(dagJws)))
    }
  }, [myDid])

  const publishTransaction = React.useCallback(() => {
    setPublishing(true)
    

    setPublishing(false)
    setPublished(true)
  }, [signedTx])

  console.log('signedTx', signedTx)

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
                  Contact Raw
                </Text>
              </CardHeader>
              <CardBody>
                <Editor
                  mode="code"
                  value={{ "key": "world", "value": "insert custom value here!" }}
                  onChange={(value: any) => {
                    console.log(value)
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
                  Contact Input
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
                  Contact State (current)
                </Text>
              </CardHeader>
              <CardBody>
                {
                  data?.contractState?.state ?
                    <Editor
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
          <Vertical />
        </GridItem>
      </Grid>
      <AccountSystem />
    </Box>
  </ChakraProvider>)
}
