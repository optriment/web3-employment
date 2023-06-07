import Link from 'next/link'
import React from 'react'
import { List, Container, Grid, Header } from 'semantic-ui-react'
import { useIsMobile } from '@/utils/use-is-mobile'

const Screen = () => {
  const isMobile = useIsMobile()

  return (
    <Grid container={!isMobile} columns={1}>
      <Grid.Column textAlign="center">
        <Header as="h1" content="Cookie policy" />
      </Grid.Column>

      <Grid.Column textAlign="justified">
        <Container text>
          <p>
            This cookie policy (“Policy”) describes what cookies are and how and
            they’re being used by the optritool.optriment.com website (“Website”
            or “Service”) and any of its related products and services
            (collectively, “Services”). This Policy is a legally binding
            agreement between you (“User”, “you” or “your”) and OPTRIMENT
            COMPUTER SYSTEMS & COMMUNICATION EQUIPMENT (doing business as
            “Optriment”, “we”, “us” or “our”). If you are entering into this
            agreement on behalf of a business or other legal entity, you
            represent that you have the authority to bind such entity to this
            agreement, in which case the terms “User”, “you” or “your” shall
            refer to such entity. If you do not have such authority, or if you
            do not agree with the terms of this agreement, you must not accept
            this agreement and may not access and use the Website and Services.
            You should read this Policy so you can understand the types of
            cookies we use, the information we collect using cookies and how
            that information is used. It also describes the choices available to
            you regarding accepting or declining the use of cookies. For further
            information on how we use, store and keep your personal data secure,
            see our <Link href="/policy">privacy policy</Link>.
          </p>
        </Container>

        <Header as="h2" content="What are cookies?" textAlign="center" />

        <Container text>
          <p>
            Cookies are small pieces of data stored in text files that are saved
            on your computer or other devices when websites are loaded in a
            browser. They are widely used to remember you and your preferences,
            either for a single visit (through a “session cookie”) or for
            multiple repeat visits (using a “persistent cookie”).
          </p>

          <p>
            Session cookies are temporary cookies that are used during the
            course of your visit to the Website, and they expire when you close
            the web browser.
          </p>

          <p>
            Persistent cookies are used to remember your preferences within our
            Website and remain on your desktop or mobile device even after you
            close your browser or restart your computer. They ensure a
            consistent and efficient experience for you while visiting the
            Website and Services.
          </p>

          <p>
            Cookies may be set by the Website (“first-party cookies”), or by
            third parties, such as those who serve content or provide
            advertising or analytics services on the Website (“third party
            cookies”). These third parties can recognize you when you visit our
            website and also when you visit certain other websites.
          </p>
        </Container>

        <Header
          as="h2"
          content="What type of cookies do we use?"
          textAlign="center"
        />

        <Container text>
          <p>
            <b>Necessary cookies</b>
          </p>

          <p>
            Necessary cookies allow us to offer you the best possible experience
            when accessing and navigating through our Website and using its
            features. For example, these cookies let us recognize that you have
            created an account and have logged into that account to access the
            content.
          </p>
        </Container>

        <Header
          as="h2"
          content="What are you cookie options?"
          textAlign="center"
        />

        <Container text>
          <p>
            If you don’t like the idea of cookies or certain types of cookies,
            you can change your browser’s settings to delete cookies that have
            already been set and to not accept new cookies. Visit
            internetcookies.com to learn more about how to do this.
          </p>

          <p>
            Please note, however, that if you delete cookies or do not accept
            them, you might not be able to use all of the features the Website
            and Services offer.
          </p>
        </Container>

        <Header as="h2" content="Changes and amendments" textAlign="center" />

        <Container text>
          <p>
            We reserve the right to modify this Policy or its terms related to
            the Website and Services at any time at our discretion. When we do,
            we will revise the updated date at the bottom of this page, post a
            notification on the main page of the Website, send you an email to
            notify you. We may also provide notice to you in other ways at our
            discretion, such as through the contact information you have
            provided.
          </p>

          <p>
            An updated version of this Policy will be effective immediately upon
            the posting of the revised Policy unless otherwise specified. Your
            continued use of the Website and Services after the effective date
            of the revised Policy (or such other act specified at that time)
            will constitute your consent to those changes.
          </p>
        </Container>

        <Header
          as="h2"
          content="Acceptance of this policy"
          textAlign="center"
        />

        <Container text>
          <p>
            You acknowledge that you have read this Policy and agree to all its
            terms and conditions. By accessing and using the Website and
            Services you agree to be bound by this Policy. If you do not agree
            to abide by the terms of this Policy, you are not authorized to
            access or use the Website and Services.
          </p>
        </Container>

        <Header as="h2" content="Contacting us" textAlign="center" />

        <Container text>
          <p>
            If you have any questions, concerns, or complaints regarding this
            Policy or the use of cookies, we encourage you to contact us using
            the details below:
          </p>

          <List bulleted>
            <List.Item>
              <a href="mailto:team@optriment.com">team@optriment.com</a>
            </List.Item>
          </List>

          <p>This document was last updated on June 7, 2023</p>
        </Container>
      </Grid.Column>
    </Grid>
  )
}

export default Screen
