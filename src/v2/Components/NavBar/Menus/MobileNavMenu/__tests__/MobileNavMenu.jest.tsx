import { SystemContextProvider } from "v2/Artsy"
import { useTracking } from "v2/Artsy/Analytics/useTracking"
import { SimpleLinkData, menuData } from "v2/Components/NavBar/menuData"
import { mount } from "enzyme"
import React from "react"
import {
  AnimatingMenuWrapper,
  BackLink,
  MobileNavMenu,
  MobileSubmenuLink,
} from "../../MobileNavMenu/MobileNavMenu"
import { MobileLink } from "../MobileLink"

jest.mock("v2/Artsy/Analytics/useTracking")

describe("MobileNavMenu", () => {
  // const mediator = {
  //   trigger: args => {
  //     console.log(args)
  //   }, //jest.fn(),
  // }
  // const trackEvent = jest.fn()
  // const getWrapper = props => {
  //   return mount(
  //     <SystemContextProvider mediator={mediator} user={props.user}>
  //       <MobileNavMenu isOpen menuData={menuData} />
  //     </SystemContextProvider>
  //   )
  // }

  const mediator = {
    trigger: jest.fn(),
  }
  const trackEvent = jest.fn()
  const noop = () => {}
  const getWrapper = props => {
    return mount(
      <SystemContextProvider mediator={mediator} user={props.user}>
        <MobileNavMenu isOpen menuData={menuData} onClose={noop} />
      </SystemContextProvider>
    )
  }

  const getMobileMenuLinkContainer = (userType = null, lab_features = []) =>
    getWrapper({ user: userType ? { userType, lab_features } : null })
      .find(AnimatingMenuWrapper)
      .filterWhere(element => element.props().isOpen)
      .find("ul")
      .at(0)

  beforeEach(() => {
    ;(useTracking as jest.Mock).mockImplementation(() => {
      return { trackEvent }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("calls logout auth action on logout menu click", () => {
    // const wrapper = getWrapper({ user: { type: "NotAdmin" } })
    // const logOut = wrapper.find("MobileLink").last()
    // logOut.simulate("click")
    // expect(mediator.trigger).toBeCalledWith("auth:logout")
    const wrapper = getWrapper({ user: { type: "NotAdmin" } })
    wrapper.find("MobileLink").last().simulate("click")
    expect(mediator.trigger).toBeCalledWith("auth:logout")
  })

  describe("nav structure", () => {
    it("renders the correct items when logged out", () => {
      const linkContainer = getMobileMenuLinkContainer()
      const mobileSubmenuLinks = linkContainer.children(MobileSubmenuLink)

      expect(mobileSubmenuLinks.length).toBe(2)

      let linkText = mobileSubmenuLinks.first().text()
      expect(linkText).toContain("Artworks")
      expect(linkText).not.toContain("New This Week")

      linkText = mobileSubmenuLinks.last().text()
      expect(linkText).toContain("Artists")
      expect(linkText).not.toContain("Career Stages")

      const simpleLinks = linkContainer.children(MobileLink)
      expect(simpleLinks.length).toBe(8)
      ;(menuData.links as SimpleLinkData[])
        .slice(2)
        .map(({ href, text }, index) => {
          const simpleLink = simpleLinks.at(index)
          expect(href).toEqual(simpleLink.prop("href"))
          expect(text).toEqual(simpleLink.text())
        })

      linkText = linkContainer.text()
      expect(linkText).toContain("Sign Up")
      expect(linkText).not.toContain("Works for you")
    })

    it("renders the account subnav when logged in", () => {
      const linkContainer = getMobileMenuLinkContainer("notAdmin")
      const mobileSubmenuLinks = linkContainer.children()
      let linkText = mobileSubmenuLinks.last().text()
      expect(linkText).toContain("Account")

      const loggedInLinks = linkContainer.children("LoggedInLinks")
      expect(loggedInLinks.length).toBe(1)
    })
  })

  describe("lab features", () => {
    it("hides inbox menu option if lab feature not enabled", () => {
      const linkContainer = getMobileMenuLinkContainer("notAdmin")
      expect(linkContainer.html()).not.toContain("Inbox")
    })

    it("shows inbox menu option if lab feature enabled", () => {
      const linkContainer = getMobileMenuLinkContainer("notAdmin", [
        "User Conversations View",
      ])
      expect(linkContainer.html()).toContain("Inbox")
    })
  })

  describe("Analytics tracking", () => {
    it("tracks back button click", () => {
      const linkContainer = getMobileMenuLinkContainer("notAdmin")

      const backLink = linkContainer.find(BackLink)
      backLink.first().simulate("click")
      expect(trackEvent).toBeCalledWith({
        action_type: "Click",
        context_module: "Header",
        flow: "Header",
        subject: "Back link",
      })
    })

    it("tracks MobileSubmenuLink click", () => {
      const linkContainer = getMobileMenuLinkContainer("notAdmin")
      linkContainer.children().first().find("Flex").first().simulate("click")
      expect(trackEvent).toHaveBeenCalledWith({
        action_type: "Click",
        context_module: "Header",
        flow: "Header",
        subject: "Artworks",
      })
    })
  })
})
