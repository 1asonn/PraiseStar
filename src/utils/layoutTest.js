// Layout组件测试工具
export const layoutTest = {
  // 测试固定Header功能
  testFixedHeader: () => {
    console.log('🧪 测试固定Header功能...')
    
    // 检查Header样式
    const header = document.querySelector('.ant-layout-header')
    if (header) {
      const styles = window.getComputedStyle(header)
      console.log('✅ Header样式检查:')
      console.log('  - position:', styles.position)
      console.log('  - top:', styles.top)
      console.log('  - z-index:', styles.zIndex)
      console.log('  - flex-shrink:', styles.flexShrink)
      console.log('  - height:', styles.height)
      
      const isFixed = styles.position === 'sticky' && styles.top === '0px'
      console.log(`✅ Header固定状态: ${isFixed ? '已固定' : '未固定'}`)
      
      return {
        isFixed,
        styles: {
          position: styles.position,
          top: styles.top,
          zIndex: styles.zIndex,
          flexShrink: styles.flexShrink,
          height: styles.height
        }
      }
    } else {
      console.log('❌ 未找到Header元素')
      return null
    }
  },

  // 测试Content滚动功能
  testContentScroll: () => {
    console.log('🧪 测试Content滚动功能...')
    
    const content = document.querySelector('.ant-layout-content')
    if (content) {
      const styles = window.getComputedStyle(content)
      console.log('✅ Content样式检查:')
      console.log('  - overflow:', styles.overflow)
      console.log('  - flex:', styles.flex)
      console.log('  - display:', styles.display)
      console.log('  - flex-direction:', styles.flexDirection)
      
      const canScroll = styles.overflow === 'auto' || styles.overflow === 'scroll'
      console.log(`✅ Content滚动状态: ${canScroll ? '可滚动' : '不可滚动'}`)
      
      return {
        canScroll,
        styles: {
          overflow: styles.overflow,
          flex: styles.flex,
          display: styles.display,
          flexDirection: styles.flexDirection
        }
      }
    } else {
      console.log('❌ 未找到Content元素')
      return null
    }
  },

  // 测试整体布局结构
  testLayoutStructure: () => {
    console.log('🧪 测试整体布局结构...')
    
    const layout = document.querySelector('.ant-layout')
    if (layout) {
      const styles = window.getComputedStyle(layout)
      console.log('✅ 主Layout样式检查:')
      console.log('  - height:', styles.height)
      console.log('  - overflow:', styles.overflow)
      
      const innerLayout = document.querySelector('.ant-layout .ant-layout')
      if (innerLayout) {
        const innerStyles = window.getComputedStyle(innerLayout)
        console.log('✅ 内部Layout样式检查:')
        console.log('  - height:', innerStyles.height)
        console.log('  - display:', innerStyles.display)
        console.log('  - flex-direction:', innerStyles.flexDirection)
      }
      
      return {
        mainLayout: {
          height: styles.height,
          overflow: styles.overflow
        },
        innerLayout: innerLayout ? {
          height: window.getComputedStyle(innerLayout).height,
          display: window.getComputedStyle(innerLayout).display,
          flexDirection: window.getComputedStyle(innerLayout).flexDirection
        } : null
      }
    } else {
      console.log('❌ 未找到Layout元素')
      return null
    }
  },

  // 测试响应式布局
  testResponsiveLayout: () => {
    console.log('🧪 测试响应式布局...')
    
    const isMobile = window.innerWidth <= 768
    console.log(`✅ 当前屏幕宽度: ${window.innerWidth}px`)
    console.log(`✅ 设备类型: ${isMobile ? '移动端' : '桌面端'}`)
    
    const header = document.querySelector('.ant-layout-header')
    if (header) {
      const styles = window.getComputedStyle(header)
             const expectedHeight = isMobile ? '70px' : '80px'
      const actualHeight = styles.height
      
      console.log(`✅ Header高度检查: 期望 ${expectedHeight}, 实际 ${actualHeight}`)
      console.log(`✅ 高度匹配: ${expectedHeight === actualHeight ? '是' : '否'}`)
      
      return {
        isMobile,
        screenWidth: window.innerWidth,
        headerHeight: {
          expected: expectedHeight,
          actual: actualHeight,
          matches: expectedHeight === actualHeight
        }
      }
    }
    
    return {
      isMobile,
      screenWidth: window.innerWidth
    }
  },

  // 测试Header标题布局
  testHeaderTitleLayout: () => {
    console.log('🧪 测试Header标题布局...')
    
    const header = document.querySelector('.ant-layout-header')
    if (header) {
      const titleContainer = header.querySelector('div[style*="flex-direction: column"]')
      if (titleContainer) {
        const mainTitle = titleContainer.querySelector('h2')
        const subtitle = titleContainer.querySelector('div')
        
        console.log('✅ 标题容器检查:')
        console.log('  - 主标题:', mainTitle?.textContent)
        console.log('  - 副标题:', subtitle?.textContent)
        console.log('  - 布局方向:', window.getComputedStyle(titleContainer).flexDirection)
        
        const hasSubtitle = subtitle && subtitle.textContent.includes('Recognize & Shine Together')
        console.log(`✅ 副标题显示: ${hasSubtitle ? '正常' : '异常'}`)
        
        return {
          mainTitle: mainTitle?.textContent,
          subtitle: subtitle?.textContent,
          hasSubtitle,
          layout: window.getComputedStyle(titleContainer).flexDirection
        }
      } else {
        console.log('❌ 未找到标题容器')
        return null
      }
    } else {
      console.log('❌ 未找到Header元素')
      return null
    }
  },

  // 测试滚动行为
  testScrollBehavior: () => {
    console.log('🧪 测试滚动行为...')
    
    const content = document.querySelector('.ant-layout-content')
    if (content) {
      // 模拟滚动测试
      const originalScrollTop = content.scrollTop
      content.scrollTop = 100
      
      setTimeout(() => {
        const newScrollTop = content.scrollTop
        console.log(`✅ 滚动测试: 原始位置 ${originalScrollTop}, 新位置 ${newScrollTop}`)
        console.log(`✅ 滚动功能: ${newScrollTop !== originalScrollTop ? '正常' : '异常'}`)
        
        // 恢复原始位置
        content.scrollTop = originalScrollTop
      }, 100)
      
      return {
        originalScrollTop,
        canScroll: content.scrollHeight > content.clientHeight
      }
    } else {
      console.log('❌ 未找到Content元素')
      return null
    }
  },

  // 完整测试
  runFullTest: () => {
    console.log('🚀 开始Layout组件完整测试...')
    
    try {
      // 1. 测试固定Header功能
      console.log('\n📋 1. 测试固定Header功能')
      const headerTest = layoutTest.testFixedHeader()
      
      // 2. 测试Content滚动功能
      console.log('\n📋 2. 测试Content滚动功能')
      const contentTest = layoutTest.testContentScroll()
      
      // 3. 测试整体布局结构
      console.log('\n📋 3. 测试整体布局结构')
      const structureTest = layoutTest.testLayoutStructure()
      
      // 4. 测试响应式布局
      console.log('\n📋 4. 测试响应式布局')
      const responsiveTest = layoutTest.testResponsiveLayout()
      
             // 5. 测试Header标题布局
       console.log('\n📋 5. 测试Header标题布局')
       const titleLayoutTest = layoutTest.testHeaderTitleLayout()
       
       // 6. 测试滚动行为
       console.log('\n📋 6. 测试滚动行为')
       const scrollTest = layoutTest.testScrollBehavior()
      
      console.log('\n📊 测试结果汇总:')
             console.log('✅ Header固定:', headerTest?.isFixed ? '正常' : '异常')
       console.log('✅ Content滚动:', contentTest?.canScroll ? '正常' : '异常')
       console.log('✅ 布局结构:', structureTest ? '正常' : '异常')
       console.log('✅ 响应式:', responsiveTest?.headerHeight?.matches ? '正常' : '异常')
       console.log('✅ 标题布局:', titleLayoutTest?.hasSubtitle ? '正常' : '异常')
      
      console.log('\n✅ Layout组件测试完成')
      
             return {
         headerTest,
         contentTest,
         structureTest,
         responsiveTest,
         titleLayoutTest,
         scrollTest
       }
      
    } catch (error) {
      console.error('❌ Layout组件测试失败:', error)
      throw error
    }
  }
}

// 在开发环境下自动挂载到window对象
if (process.env.NODE_ENV === 'development') {
  window.layoutTest = layoutTest
  console.log('🛠️ Layout组件测试工具已加载到 window.layoutTest')
  console.log('可用命令:')
  console.log('  - layoutTest.testFixedHeader() - 测试固定Header功能')
  console.log('  - layoutTest.testContentScroll() - 测试Content滚动功能')
  console.log('  - layoutTest.testLayoutStructure() - 测试整体布局结构')
  console.log('  - layoutTest.testResponsiveLayout() - 测试响应式布局')
  console.log('  - layoutTest.testHeaderTitleLayout() - 测试Header标题布局')
  console.log('  - layoutTest.testScrollBehavior() - 测试滚动行为')
  console.log('  - layoutTest.runFullTest() - 运行完整测试')
}

export default layoutTest
