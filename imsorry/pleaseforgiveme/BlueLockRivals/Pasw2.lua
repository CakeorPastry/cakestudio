-- // Base Services
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UIS = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local TweenInfoSetting = TweenInfo.new(1, Enum.EasingStyle.Linear)

local player = Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local team = player.Team

-- Auto-update team
player:GetPropertyChangedSignal("Team"):Connect(function()
    team = player.Team
end)

-- Auto-update character
player.CharacterAdded:Connect(function(char)
    character = char
end)

local function getPlayerComponents()
    local hrp = character and character:FindFirstChild("HumanoidRootPart")
    local hasBall = character and character:FindFirstChild("Values") and character.Values:FindFirstChild("HasBall")
    local football = nil

    for _, player in ipairs(Players:GetPlayers()) do
        local char = player.Character
        if char and char:FindFirstChild("Football") then
            football = char:FindFirstChild("Football")
            break
        end
    end

    if not football then
        football = workspace:FindFirstChild("Football")
    end

    if not football then
        football = character and character:FindFirstChild("Football")
    end

    return football, hrp, hasBall
end

function randomString()
    local length = math.random(10, 20)
    local array = {}
    for i = 1, length do
        array[i] = string.char(math.random(32, 126))
    end
    return table.concat(array)
end

function releaseBall()
    local args = {
        30,
        [4] = vector.create(5, 15, 15)
    }
    game:GetService("ReplicatedStorage"):WaitForChild("Packages"):WaitForChild("Knit"):WaitForChild("Services"):WaitForChild("BallService"):WaitForChild("RE"):WaitForChild("Shoot"):FireServer(unpack(args))
end

local screenGui = Instance.new("ScreenGui", game.CoreGui)
screenGui.Name = randomString()
screenGui.ResetOnSpawn = false

local notificationFrame = Instance.new("Frame")
notificationFrame.Size = UDim2.new(0, 626, 0, 59)
notificationFrame.Position = UDim2.new(0.5, 0, 0.268415093, 0)
notificationFrame.AnchorPoint = Vector2.new(0.5, 0.5)
notificationFrame.BackgroundTransparency = 1
notificationFrame.Parent = screenGui
notificationFrame.Name = "Output"

local gridLayout = Instance.new("UIGridLayout")
gridLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
gridLayout.VerticalAlignment = Enum.VerticalAlignment.Bottom
gridLayout.SortOrder = Enum.SortOrder.LayoutOrder
gridLayout.StartCorner = Enum.StartCorner.TopLeft
gridLayout.CellPadding = UDim2.new(0, 0, 0, 0)
gridLayout.CellSize = UDim2.new(1, 0, 0.349999994, 0)
gridLayout.Parent = notificationFrame

function PlaySound(id)

    --[[
    9070284921 - Beautiful Girls (LOUD) (SHORT)
    97495881842727 - DO NOT REDEEM
    6204175492 - ara ara 2
    7784389087 - DJ Snake - YAMH
    7510781592 - slap oh
    80959855784919 - Man screaming meme sound effect
    
    ]]

    local table = {
        9070284921,
        97495881842727,
        6204175492,
        7784389087,
        7510781592,
        80959855784919
    }
    local Sound = Instance.new("Sound")
    local finalId = id or table[math.random(1, #table)]
    Sound.SoundId = "rbxassetid://" .. finalId
    Sound.Parent = workspace
    Sound:Play()
    Sound.Ended:Wait()
    Sound:Destroy()
end

function CreateNotification(text, color, duration)
    local notification = Instance.new("TextLabel")
    notification.Size = UDim2.new(1, 0, 1, 0)
    notification.AnchorPoint = Vector2.new(0.5, 0.5)
    notification.Position = UDim2.new(0, 0, 0, 0)
    notification.TextColor3 = color or Color3.new(1, 1, 1)
    notification.BackgroundTransparency = 1
    notification.TextSize = 20
    notification.Text = text
    notification.TextTransparency = 0
    notification.TextWrapped = false
    notification.TextScaled = true
    notification.Parent = notificationFrame
    task.spawn(function()
        PlaySound("9102731048")
    end)
    task.wait(duration or 5)
    local destroyTween = TweenService:Create(notification, TweenInfoSetting, { TextTransparency = 1 })
    destroyTween:Play()
    destroyTween.Completed:Wait()
    notification:Destroy()
end

if game.GameId ~= 6325068386 then
    task.spawn(function()
        CreateNotification("This script is only for the game \"Blue Lock: Rivals\".", Color3.new(255, 0, 0), 5)
        screenGui:Destroy()
    end)
    PlaySound()
    return
end

if imsorry_pleaseforgiveme_BlueLockRivals_Pasw_lua_LOADED then
    task.spawn(function()
        CreateNotification("This script is already running!", Color3.new(255, 0, 0), 5)
        screenGui:Destroy()
    end)
    pcall(function() imsorry_pleaseforgiveme_BlueLockRivals_Pasw_lua_frame.Position = UDim2.new(0, 10, 0.5, -40) end)
    error("/imsorry/pleaseforgiveme/BlueLockRivals/Pasw.lua is already running!", 0)
    return
end

pcall(function() getgenv().imsorry_pleaseforgiveme_BlueLockRivals_Pasw_lua_LOADED = true end)

local frameHeight = 220
local headerHeight = 36
local isMinimized = false
local animating = false

--[[
local screenGui = Instance.new("ScreenGui", game.Players.LocalPlayer:WaitForChild("PlayerGui"))
screenGui.Name = "StyledMenu"
]]

-- Main Frame (Unified with header and content)
local frame = Instance.new("Frame", screenGui)
frame.Size = UDim2.new(0, 240, 0, frameHeight)
frame.Position = UDim2.new(0, 10, 0.5, -frameHeight / 2)
frame.BackgroundColor3 = Color3.new(0, 0, 0)
frame.Active = true
frame.Draggable = true
frame.BorderSizePixel = 0
frame.Name = "UnifiedFrame"
frame.ClipsDescendants = true
frame.BackgroundTransparency = 0
frame.ZIndex = 2
frame.AnchorPoint = Vector2.new(0, 0.5)
frame.AutomaticSize = Enum.AutomaticSize.None
frame.SizeConstraint = Enum.SizeConstraint.RelativeXY
frame.BorderColor3 = Color3.new(1, 1, 1)
frame.BorderMode = Enum.BorderMode.Outline
frame.BorderSizePixel = 1
frame.AutomaticSize = Enum.AutomaticSize.None
frame.ClipsDescendants = true
frame.BackgroundTransparency = 0
frame.ZIndex = 2
frame:ClearAllChildren()
frame:SetAttribute("ExpandedSize", frameHeight)

local uicorner = Instance.new("UICorner", frame)
uicorner.CornerRadius = UDim.new(0, 12)

-- Header
local header = Instance.new("Frame", frame)
header.Size = UDim2.new(1, 0, 0, headerHeight)
header.BackgroundTransparency = 1
header.Name = "Header"

local title = Instance.new("TextLabel", header)
title.Size = UDim2.new(1, -40, 1, 0)
title.Position = UDim2.new(0, 10, 0, 0)
title.BackgroundTransparency = 1
title.Text = "Pasw Menu"
title.TextColor3 = Color3.new(1, 1, 1)
title.Font = Enum.Font.GothamBold
title.TextSize = 20
title.TextXAlignment = Enum.TextXAlignment.Left

local toggleBtn = Instance.new("TextButton", header)
toggleBtn.Size = UDim2.new(0, 30, 0, 30)
toggleBtn.Position = UDim2.new(1, -36, 0, 3)
toggleBtn.Text = "-"
toggleBtn.BackgroundColor3 = Color3.new(1, 1, 1)
toggleBtn.TextColor3 = Color3.new(0, 0, 0)
toggleBtn.Font = Enum.Font.GothamBold
toggleBtn.TextSize = 20
toggleBtn.BorderSizePixel = 0

local uibtnCorner = Instance.new("UICorner", toggleBtn)
uibtnCorner.CornerRadius = UDim.new(0, 6)

-- Content (Scroll list)
local content = Instance.new("Frame", frame)
content.Name = "Content"
content.Position = UDim2.new(0, 0, 0, headerHeight)
content.Size = UDim2.new(1, 0, 1, -headerHeight)
content.BackgroundTransparency = 1
content.ClipsDescendants = true

local scrollingFrame = Instance.new("ScrollingFrame", content)
scrollingFrame.Size = UDim2.new(1, -20, 1, -20)
scrollingFrame.Position = UDim2.new(0, 10, 0, 10)
scrollingFrame.CanvasSize = UDim2.new(0, 0, 1, 0)
scrollingFrame.ScrollBarThickness = 4
scrollingFrame.BackgroundTransparency = 1
scrollingFrame.AutomaticCanvasSize = Enum.AutomaticSize.Y
scrollingFrame.ScrollingDirection = Enum.ScrollingDirection.Y

local gridLayout = Instance.new("UIGridLayout", scrollingFrame)
gridLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
gridLayout.VerticalAlignment = Enum.VerticalAlignment.Top
gridLayout.SortOrder = Enum.SortOrder.LayoutOrder
gridLayout.CellPadding = UDim2.new(0, 6, 0, 6)
gridLayout.CellSize = UDim2.new(1, -12, 0, 40)

-- Function to create a styled button
local function createStyledButton(text)
    local btn = Instance.new("TextButton")
    btn.Size = UDim2.new(1, -12, 0, 30)
    btn.Text = text
    btn.BackgroundColor3 = Color3.new(0, 0, 0)
    btn.TextColor3 = Color3.new(1, 1, 1)
    btn.Font = Enum.Font.Gotham
    btn.TextSize = 16
    btn.BorderSizePixel = 1
    btn.BorderColor3 = Color3.new(1, 1, 1)
    btn.AutoButtonColor = true

    local corner = Instance.new("UICorner", btn)
    corner.CornerRadius = UDim.new(0, 6)

    btn.Parent = scrollingFrame
    return btn
end

-- Buttons
createStyledButton("Pasw")
createStyledButton("Sublimation")
createStyledButton("Hold Position: OFF")
createStyledButton("Fetch")
createStyledButton("Pass Mode: Normal")

-- Minimize/Maximize Logic
local function toggleMinimize()
    if animating then return end
    animating = true
    isMinimized = not isMinimized
    toggleBtn.Text = isMinimized and "+" or "-"

    local targetSize = isMinimized and UDim2.new(0, 240, 0, headerHeight) or UDim2.new(0, 240, 0, frameHeight)
    local tween = TweenService:Create(frame, TweenInfo.new(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {Size = targetSize})
    tween:Play()
    tween.Completed:Connect(function()
        animating = false
    end)
end

toggleBtn.MouseButton1Click:Connect(toggleMinimize)

local holdActive = false 

pcall(function() getgenv().imsorry_pleaseforgiveme_BlueLockRivals_Pasw_lua_frame = frame end)

local canUse = {
    ["Pasw"] = true,
    ["Sublimation"] = true, 
    ["Hold"] = true, -- Unused
    ["Fetch"] = true
}

local passMode = "Normal"

local function changePassMode() 
    if passMode == "Normal" then
        passMode = "Enemy"
    elseif passMode == "Enemy" then
        passMode = "GK"
    else 
        passMode = "Normal"
    end
    passModeButton.Text = "Pass Mode: "..passMode
end

local function GetHoldAnchor()
    local anchor = Instance.new("Part")
    anchor.Name = randomString()
    anchor.Size = Vector3.new(1, 1, 1)
    anchor.Anchored = true
    anchor.CanCollide = false
    anchor.Transparency = 0
    anchor.CFrame = CFrame.new(38.3946228, 131.166382, -50.307148)
    anchor.Parent = workspace
    return anchor
end

local function getBestTarget()
    local camera = workspace.CurrentCamera
    local hrp = character and character:FindFirstChild("HumanoidRootPart")
    if not hrp then return end

    local furthest, furthestDist = nil, -1
    local bestInView, viewAngle = nil, math.huge

    if passMode == "Enemy" then
        for _, p in ipairs(Players:GetPlayers()) do
            if p ~= player and p.Team ~= team and p.Character and p.Character:FindFirstChild("HumanoidRootPart") then
                local targetHRP = p.Character.HumanoidRootPart
                local dirToTarget = (targetHRP.Position - hrp.Position).Unit
                local cameraDir = camera.CFrame.LookVector
                local angle = math.deg(math.acos(dirToTarget:Dot(cameraDir)))
                local dist = (hrp.Position - targetHRP.Position).Magnitude

                if dist > furthestDist then
                    furthest = p
                    furthestDist = dist
                end

                if angle <= 25 and angle < viewAngle then
                    viewAngle = angle
                    bestInView = p
                end
            end
        end
        return bestInView or furthest

    elseif passMode == "GK" then

        local values = character and character:FindFirstChild("Values")
        local isGoalie = values and values:FindFirstChild("Goalie") and values.Goalie.Value
        if isGoalie then
            --[[
            task.spawn(function()
                CreateNotification("You are the goalie!", Color3.new(1, 0, 0), 5)
            end)
            ]]
            return nil
        end


        for _, p in ipairs(Players:GetPlayers()) do
            if p.Team == team and p.Character then
                local valuesFolder = p.Character:FindFirstChild("Values")
                if valuesFolder then
                    local goalie = valuesFolder:FindFirstChild("Goalie")
                    if goalie and goalie.Value and p.Character:FindFirstChild("HumanoidRootPart") then
                        return p
                    end
                end
            end
        end

        local aiTeamGK = workspace:FindFirstChild("AI")
        if aiTeamGK and aiTeamGK:FindFirstChild(team.Name) and aiTeamGK[team.Name]:FindFirstChild("GK") then
            return aiTeamGK[team.Name].GK
        end
        return nil
    else
        for _, p in ipairs(Players:GetPlayers()) do
            if p ~= player and p.Team == team and p.Character and p.Character:FindFirstChild("HumanoidRootPart") then
                local values = p.Character:FindFirstChild("Values")
                if values then
                    local goalie = values:FindFirstChild("Goalie")
                    if goalie and goalie.Value then
                        continue
                    end
                end

                local targetHRP = p.Character.HumanoidRootPart
                local dirToTarget = (targetHRP.Position - hrp.Position).Unit
                local cameraDir = camera.CFrame.LookVector
                local angle = math.deg(math.acos(dirToTarget:Dot(cameraDir)))
                local dist = (hrp.Position - targetHRP.Position).Magnitude

                if dist > furthestDist then
                    furthest = p
                    furthestDist = dist
                end

                if angle <= 25 and angle < viewAngle then
                    viewAngle = angle
                    bestInView = p
                end
            end
        end
        return bestInView or furthest
    end
end


local ABC = {}
ABC.Connections = {}

function ABC:Connect(signal, func)
    local conn = signal:Connect(func)
    table.insert(self.Connections, conn)
end

function ABC:Clean()
    for _, conn in ipairs(self.Connections) do
        if conn.Disconnect then conn:Disconnect() end
    end
    self.Connections = {}
end

-- This is your smart avoidance helper function
local function GetAvoidanceOffset(footballPos, baseDir)
    for _, player in pairs(Players:GetPlayers()) do
        if player ~= Players.LocalPlayer and player.Character then
            local otherHRP = player.Character:FindFirstChild("HumanoidRootPart")
            if otherHRP then
                local toOther = otherHRP.Position - footballPos
                local dist = toOther.Magnitude
                local angle = math.acos(baseDir:Dot(toOther.Unit))

                if dist < 10 and angle < math.rad(35) then
                    -- Offset direction to steer slightly away
                    return (footballPos - otherHRP.Position).Unit * 0.75
                end
            end
        end
    end
    return Vector3.zero
end

local function Pasw()
    if not canUse["Pasw"] then
        task.spawn(function()
            CreateNotification("Ability is on cooldown.", Color3.new(1, 1, 0), 5)
        end)
        return
    end

    local football, hrp, hasBall = getPlayerComponents()
    if not (hasBall and hasBall.Value) or not football or not hrp then
        task.spawn(function()
            CreateNotification("Missing ball, HumanoidRootPart or you don't have the ball.", Color3.new(1, 0, 0), 5)
        end)
        return
    end

    local target = getBestTarget()
    local targetHRP
    if typeof(target) == "Instance" and target:IsA("Model") then
        targetHRP = target:FindFirstChild("HumanoidRootPart")
    elseif target and target.Character then
        targetHRP = target.Character:FindFirstChild("HumanoidRootPart")
    end

    if not targetHRP then
        local msg = "No valid teammate to pass to."
        if passMode == "Enemy" then
            msg = "No valid enemy/player to pass to."
        elseif passMode == "GK" then
            msg = "No valid goalie to pass to or you are the goalie."
        end
        task.spawn(function()
            CreateNotification(msg, Color3.new(1, 1, 0), 5)
        end)
        return
    end

    task.spawn(function()
        local anim = Instance.new("Animation")
        anim.AnimationId = "rbxassetid://83376040878208"
        local track = character:FindFirstChildOfClass("Humanoid"):LoadAnimation(anim)
        track.Priority = Enum.AnimationPriority.Action4
        track:Play()
        PlaySound("87838758006658")
    end)

    canUse["Pasw"] = false
    task.delay(1, function()
        canUse["Pasw"] = true
    end)

    releaseBall()
    task.wait(0.5)

    local velocity = targetHRP:FindFirstChild("AssemblyLinearVelocity") and targetHRP.AssemblyLinearVelocity or Vector3.zero
    if velocity.Magnitude < 0.1 then
        velocity = Vector3.zero
    end

    local predictedPos = targetHRP.Position + velocity * Vector3.new(1, 0, 1)
    local baseDir = (predictedPos - hrp.Position).Unit + Vector3.new(0, 0.5, 0)
    local avoidOffset = GetAvoidanceOffset(football.Position, baseDir)
    local dir = (baseDir + avoidOffset).Unit
    local speed = math.clamp((targetHRP.Position - hrp.Position).Magnitude * 1.5, 0, 150)
    football.AssemblyLinearVelocity = dir * speed

    local t0 = tick()
    ABC:Clean()

    ABC:Connect(RunService.Heartbeat, function(dt)
        if not football or not football:IsDescendantOf(workspace) then
            ABC:Clean()
            task.spawn(function()
                CreateNotification("Pasw ended: football missing or removed from workspace.", Color3.new(1, 0, 0), 5)
            end)
            return
        end

        if football.Parent == character then
            ABC:Clean()
            task.spawn(function()
                CreateNotification("Pasw terminated: ball reattached to character.", Color3.new(1, 0, 0), 5)
            end)
            return
        elseif football.Parent ~= workspace then
            ABC:Clean()
            return
        elseif football.Parent ~= workspace and not football.Parent:IsA("Model") then
            ABC:Clean()
            task.spawn(function()
                CreateNotification("Pasw failed: unexpected ball state.", Color3.new(1, 0, 0), 5)
            end)
            return
        end

        if tick() - t0 > 10 then
            ABC:Clean()
            task.spawn(function()
                CreateNotification("Pasw timed out after 10 seconds.", Color3.new(1, 0, 0), 5)
            end)
            return
        end

        local toTarget = (targetHRP.Position - football.Position).Unit + Vector3.new(0, 0.35, 0)
        local avoidance = GetAvoidanceOffset(football.Position, toTarget)
        dir = dir:Lerp((toTarget + avoidance).Unit, 6.5 * dt)
        speed = math.clamp((targetHRP.Position - hrp.Position).Magnitude * 2.75, 0, 150)
        football.AssemblyLinearVelocity = dir * speed
    end)
end

local function Sublimation()
  if not canUse["Sublimation"] then
    task.spawn(function()
      CreateNotification("Ability is on cooldown.", Color3.new(1,1,0),5)
    end)
    return
  end

  local football, hrp, hasBall = getPlayerComponents()

  if hasBall and hasBall.Value and football then
    task.spawn(function()
      CreateNotification("You must not have the ball to use Sublimation!", Color3.new(1,0,0),5)
    end)
    return
  end

  if not football then
    task.spawn(function()
      CreateNotification("Football object not found!", Color3.new(1,0,0),5)
    end)
    return
  end

  local ownerValue = football:FindFirstChild("Char")
  if not ownerValue then
    task.spawn(function()
      CreateNotification("Ownership tag missing from football!", Color3.new(1,0,0),5)
    end)
    return
  elseif ownerValue.Value ~= character then
    task.spawn(function()
      CreateNotification("You are not the owner of this ball!", Color3.new(1,0,0),5)
    end)
    return
  end

  canUse["Sublimation"] = false

  local speed = 150
  local dir = (hrp.Position - football.Position).Unit + Vector3.new(0,0.45,0)
  local t0 = tick()
  ABC:Clean()

  -- Start tracking immediately (no delay)
  ABC:Connect(RunService.Heartbeat,function(dt)
    if not football or not football.Parent then
      ABC:Clean()
      task.spawn(function()
        CreateNotification("Sublimation stopped: football missing or destroyed.", Color3.new(1,0,0),5)
      end)
      return
    end

    if football.Parent == character then
      ABC:Clean()
      --[[
      task.spawn(function()
        CreateNotification("Sublimation stopped: ball was reattached to character.", Color3.new(1,0,0),5)
      end)
      ]]
      return
    elseif football.Parent ~= character and football.Parent ~= workspace then
      ABC:Clean()
      local who = football.Parent.Name or "someone else"
      task.spawn(function()
        CreateNotification("Sublimation failed: ball touched or taken by "..who, Color3.new(1,0,0),5)
      end)
      return
    end

    if tick() - t0 > 5 then
      ABC:Clean()
      task.spawn(function()
        CreateNotification("Sublimation timed out: took too long.", Color3.new(1,0,0),5)
      end)
      return
    end

    local baseDir = (hrp.Position - football.Position).Unit + Vector3.new(0,0.45,0)
    local avoidOffset = GetAvoidanceOffset(football.Position,baseDir)
    local finalDir = (baseDir + avoidOffset).Unit
    dir = dir:Lerp(finalDir,8.5*dt)
    football.AssemblyLinearVelocity = dir * speed
  end)

    task.delay(1,function()
        canUse["Sublimation"] = true
    end)

end

local function HoldPosition()
  local football, hrp, hasBall = getPlayerComponents()
  local anchor = nil

  if not football or not hrp then
    task.spawn(function()
      CreateNotification("Missing football or character part.", Color3.new(1,0,0),5)
    end)
    holdActive = false
    holdPositionButton.Text = "Hold Position: OFF"
    return
  end

  local ownerValue = football:FindFirstChild("Char")
  local isOwner = ownerValue and ownerValue.Value == character

  if not (hasBall and hasBall.Value) and not isOwner then
    task.spawn(function()
      CreateNotification("You are not the ball owner!", Color3.new(1,0,0),5)
    end)
    holdActive = false
    holdPositionButton.Text = "Hold Position: OFF"
    return
  end

  holdActive = true
  holdPositionButton.Text = "Hold Position: ON"
  task.spawn(function()
    CreateNotification("Hold Position Activated!", Color3.fromRGB(0,255,0),5)
  end)

  anchor = GetHoldAnchor()
  local targetPos = anchor.Position

  if hasBall and hasBall.Value then
    task.spawn(function()
      local anim = Instance.new("Animation")
      anim.AnimationId = "rbxassetid://83376040878208"
      local track = character:FindFirstChildOfClass("Humanoid"):LoadAnimation(anim)
      track.Priority = Enum.AnimationPriority.Action4
      track:Play()
      PlaySound("87838758006658")
    end)
    releaseBall()
    task.wait(0.5)
  end

  local dir = (targetPos - football.Position).Unit + Vector3.new(0,0.55,0)
  local avoidOffset = GetAvoidanceOffset(football.Position,dir)
  dir = (dir + avoidOffset).Unit
  local speed = math.clamp((targetPos - football.Position).Magnitude*1.5,0,150)
  football.AssemblyLinearVelocity = dir * speed

  ABC:Clean()

  -- Start the main heartbeat immediately
  ABC:Connect(RunService.Heartbeat,function(dt)
    if football.Parent == character then
      ABC:Clean()
      holdActive = false
      holdPositionButton.Text = "Hold Position: OFF"
      if anchor and anchor.Parent then anchor:Destroy() end
      task.spawn(function()
        CreateNotification("Hold ended: ball was picked up.", Color3.new(1,0,0),5)
      end)
      Sublimation()
      return
    elseif football.Parent ~= character and football.Parent ~= workspace then
      ABC:Clean()
      holdActive = false
      holdPositionButton.Text = "Hold Position: OFF"
      if anchor and anchor.Parent then anchor:Destroy() end
      task.spawn(function()
        CreateNotification("Hold failed: ball was intercepted by another player.", Color3.new(1,0,0),5)
      end)
      return
    end

    if not holdActive or not football:IsDescendantOf(workspace) then
      ABC:Clean()
      if anchor and anchor.Parent then anchor:Destroy() end
      holdPositionButton.Text = "Hold Position: OFF"
      task.spawn(function()
        CreateNotification("Hold manually terminated or ball removed.", Color3.fromRGB(255,255,0),5)
      end)
      Sublimation()
      return
    end

    local dist = (football.Position - targetPos).Magnitude
    if dist > 5 then
      local baseDir = (targetPos - football.Position).Unit + Vector3.new(0,0.55,0)
      local avoid = GetAvoidanceOffset(football.Position,baseDir)
      dir = dir:Lerp((baseDir + avoid).Unit,6.5*dt)
      speed = math.clamp(dist*1.8,0,150)
      football.AssemblyLinearVelocity = dir * speed
    else
      -- start orbiting immediately, no delay
      local angle = 0
      local radius = isOwner and 60 or 50
      local spinSpeed = isOwner and 1.2 or 0.9
      local center = targetPos

      ABC:Clean()
      ABC:Connect(RunService.Heartbeat,function(dt2)
        if football.Parent == character then
          ABC:Clean()
          holdActive = false
          holdPositionButton.Text = "Hold Position: OFF"
          if anchor and anchor.Parent then anchor:Destroy() end
          task.spawn(function()
            CreateNotification("Hold ended: you picked up the ball.", Color3.new(1,0,0),5)
          end)
          Sublimation()
          return
        elseif football.Parent ~= character and football.Parent ~= workspace then
          ABC:Clean()
          holdActive = false
          holdPositionButton.Text = "Hold Position: OFF"
          if anchor and anchor.Parent then anchor:Destroy() end
          task.spawn(function()
            CreateNotification("Hold failed: another player interfered during orbit.", Color3.new(1,0,0),5)
          end)
          return
        end

        angle += math.pi*2*spinSpeed*dt2
        local x = math.cos(angle)*radius
        local z = math.sin(angle)*radius
        local target = center + Vector3.new(x,0,z)
        local moveDir = (target - football.Position).Unit
        football.AssemblyLinearVelocity = moveDir * 80 + Vector3.new(0,6,0)
      end)
    end
  end)
end

local function Fetch() 
    if not canUse["Fetch"] then
        task.spawn(function()
            CreateNotification("Ability is on cooldown.", Color3.new(1, 1, 0), 5)
        end)
        return
    end

    canUse["Fetch"] = false

    local football, hrp = getPlayerComponents()
    local amount = 5

    if not football or not hrp then
        task.spawn(function()
            CreateNotification("Missing football or HumanoidRootPart.", Color3.new(1, 0, 0), 5)
        end)
    end

    for index = 1, amount do
        pcall(function()
            hrp.CFrame = football.CFrame
            task.wait(0.1)
        end)
    end

    canUse["Fetch"] = true    
end

PaswButton.Activated:Connect(Pasw) 
SublimationButton.Activated:Connect(Sublimation)

holdPositionButton.Activated:Connect(function()
    holdActive = not holdActive
    holdPositionButton.Text = "Hold Position: " .. (holdActive and "ON" or "OFF")

    if holdActive then
        HoldPosition()
    else
        ABC:Clean()
        CreateNotification("Hold Position Deactivated!", Color3.fromRGB(255, 255, 0), 5)
    end
end)

FetchButton.Activated:Connect(Fetch)

passModeButton.Activated:Connect(changePassMode)

task.spawn(function()
    CreateNotification("Cf pasw", Color3.new(0, 255, 0), 5)
end)
PlaySound()